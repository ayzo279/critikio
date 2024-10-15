from django.shortcuts import render
import time
import spotipy
import numpy as np
from spotipy.oauth2 import SpotifyClientCredentials
import os
import random

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Recommendation
from .serializers import RecommendationSerializer

class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer

    @action(detail=False, methods=['post'])
    def process_recommendations(self, request):  # Add `self` as the first parameter
        referenceTrack = request.data.get('referenceTrack')
        referenceArtist = request.data.get('referenceArtist')
        filters = request.data.get('toggles', {})
        artists = request.data.get('badges', [])

        recommended_songs = get_recommendations(referenceTrack, referenceArtist, artists, filters)

        rec_list = [song for song in recommended_songs.values()]
        
        recommendation = Recommendation(
            song_name=referenceTrack,
            artist_name=referenceArtist,
            recommended_songs=rec_list
        )
        recommendation.save()

        serializer = RecommendationSerializer(recommendation)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# Compute normalized Euclidean distance
def compute_similarity(song1, song2, filters: dict[str, bool], weight=4):
    dist = 0
    defaults = ["tempo","acousticness","key","mode","liveness","loudness","time_signature"]

    # Normalize tempo data between 0 and 1, clip in case of outliers
    song1["tempo"] = np.clip(np.interp(song1["tempo"], [0, 200], [0, 1]), 0, 1)
    song2["tempo"] = np.clip(np.interp(song2["tempo"], [0, 200], [0, 1]), 0, 1)

    # Normalize key data 
    song1["key"], song2["key"] = np.interp(song1["key"], [-1, 11], [0, 1]), np.interp(song2["key"], [-1, 11], [0, 1])

    # Normalize loudness
    song1["loudness"], song2["loudness"] = np.clip(np.interp(song1["loudness"], [-60, 0], [0, 1]), 0, 1), np.clip(np.interp(song2["loudness"], [-60, 0], [0, 1]), 0, 1)

    # Normalize time signatures
    song1["time_signature"], song2["time_signature"] = np.interp(song1["time_signature"], [3, 7], [0, 1]), np.interp(song2["time_signature"], [3, 7], [0, 1])


    # Calculate similarity using default features
    for default_feature in defaults:
        dist += (song1[default_feature] - song2[default_feature]) ** 2

    # Include selected features based on filters, weighted more heavily for user preferences
    for feature in filters.keys():
        if filters[feature]:
            dist += weight * (song1[feature] - song2[feature]) ** 2

    max_dist = np.sqrt(len(defaults) + sum(weight for feature in filters if filters[feature]))

    similarity = 1 - (dist/max_dist)
    return np.sqrt(similarity)

def get_recommendations(song, artist, artist_list, filters, count=5):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sample_size = 10
    
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))

    # Search for the input song to get its track ID
    search_query = f"track:{song} artist:{artist}"
    result = sp.search(q=search_query, type='track', limit=1)

    # Get Track ID of input song
    if not result or not result['tracks']['items']:
        return {}  # Return an empty dict if song not found

    track_id = result['tracks']['items'][0]['id']
    
    # Store artist IDs of input artist list
    artist_ids = []
    for artist_name in artist_list:
        result = sp.search(q=artist_name, type='artist', limit=1)
        if result and result['artists']['items']:
            artist_ids.append(result['artists']['items'][0]['id'])

    rankings = {}
    
    for artist_id in artist_ids:
        albums = []
        results = sp.artist_albums(artist_id=artist_id, album_type='album', limit=15)
        albums.extend(results['items'])
        
        all_tracks = []
        for album in albums:
            album_id = album['id']
            tracks = sp.album_tracks(album_id)['items']
            
            # Ensure this is a list and has enough tracks
            if isinstance(tracks, list) and len(tracks) > 0:
                sampled_tracks = random.sample(tracks, min(sample_size, len(tracks)))
                all_tracks.extend(sampled_tracks)

        artist_rankings = {}
        try:
            input_track_features = sp.audio_features(track_id)[0]
        except spotipy.exceptions.SpotifyException as e:
            if e.http_status == 429:  # Too Many Requests
                retry_after = int(e.headers.get('Retry-After', 5))
                print(f"Rate limit exceeded. Retrying after {retry_after} seconds.")
                time.sleep(retry_after)
                input_track_features = sp.audio_features(track_id)[0]

        for track in all_tracks:
            try:
                track_features = sp.audio_features(track['id'])[0]
            except spotipy.exceptions.SpotifyException as e:
                if e.http_status == 429:  # Too Many Requests
                    retry_after = int(e.headers.get('Retry-After', 5))
                    print(f"Rate limit exceeded. Retrying after {retry_after} seconds.")
                    time.sleep(retry_after)
                    track_features = sp.audio_features(track['id'])[0]

            if track_features is not None:  # Check if audio features were retrieved
                similarity = compute_similarity(input_track_features, track_features, filters)
                artist_rankings[track['id']] = similarity

        # Sort and update rankings
        artist_rankings = dict(sorted(artist_rankings.items(), key=lambda item: item[1]))
        for track_id, similarity in list(artist_rankings.items())[:count]:
            rankings[track_id] = [sp.track(track_id)["name"], similarity]

    # Return only the top `count` rankings
    return dict(sorted(rankings.items(), key=lambda item: item[1])[:count])