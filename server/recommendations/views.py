from django.shortcuts import render
import time
import spotipy
import numpy as np
from spotipy.oauth2 import SpotifyClientCredentials
import os
import random
import time 

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Recommendation
from .serializers import RecommendationSerializer

api_call_count = 20
start_time = time.time()

class RecommendationViewSet(viewsets.ModelViewSet):
    queryset = Recommendation.objects.all()
    serializer_class = RecommendationSerializer

    def create(self, request, *args, **kwargs):
        return self.process_recommendations(request)
    
    @action(detail=False, methods=['post'])
    def process_recommendations(self, request):  # Add `self` as the first parameter
        referenceTrack = request.data.get('referenceTrack')
        referenceArtist = request.data.get('referenceArtist')
        filters = request.data.get('toggles', {})
        artists = request.data.get('badges', [])

        recommended_songs = get_recommendations(referenceTrack, referenceArtist, artists, filters)

        rec_list = [song for song in recommended_songs.values()]
        
        # print(rec_list)
        
        recommendation = Recommendation(
            referenceTrack=referenceTrack,
            referenceArtist=referenceArtist,
            recommended_songs=rec_list
        )
        recommendation.save()

        serializer = RecommendationSerializer(recommendation)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


def rate_limited_api_call(func, *args, **kwargs):
        global api_call_count, start_time

        # Check the time since the last API call
        current_time = time.time()
        elapsed_time = current_time - start_time

        # If we have hit 20 calls in the current second, wait for the next second
        if api_call_count >= 20:
            time.sleep(1)  # Sleep for the remainder of the second
            # Reset call count and start time for the next second
            api_call_count = 0
            start_time = time.time()

        # Call the actual API function
        api_call_count += 1
        return func(*args, **kwargs)

# Compute normalized Euclidean distance
def compute_similarity(song1, song2, filters: dict[str, bool], weight=2):
    dist = 0
    defaults = ["tempo","acousticness","key","mode","liveness","loudness","time_signature"]

    # Normalize tempo data between 0 and 1, clip in case of outliers
    song2["tempo"] = np.clip(np.interp(song2["tempo"], [0, 200], [0, 1]), 0, 1)

    # Normalize key data 
    song2["key"] = np.interp(song2["key"], [-1, 11], [0, 1])

    # Normalize loudness
    song2["loudness"] = np.clip(np.interp(song2["loudness"], [-60, 0], [0, 1]), 0, 1)

    # Normalize time signatures
    song2["time_signature"] = np.interp(song2["time_signature"], [3, 7], [0, 1])


    # Calculate similarity using default features
    for default_feature in defaults:
        dist += (song1[default_feature] - song2[default_feature]) ** 2

    # Include selected features based on filters, weighted more heavily for user preferences
    for feature in filters.keys():
        if filters[feature]:
            dist += weight * (song1[feature] - song2[feature]) ** 2

    dist = np.sqrt(dist)

    max_dist = np.sqrt(len(defaults) + sum(weight for feature in filters if filters[feature]))

    similarity = 1 - (dist/max_dist)
    return similarity

def get_recommendations(song, artist, artist_list, filters, count=5):
    global api_call_count, start_time
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sample_size = 5
    
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))

    # Search for the input song to get its track ID
    search_query = f"track:{song} artist:{artist}"
    result = rate_limited_api_call(sp.search, q=search_query, type='track', limit=1)

    
    # Get Track ID of input song
    if not result or not result['tracks']['items']:
        return {}  # Return an empty dict if song not found

    track_id = result['tracks']['items'][0]['id']
    
    # Store artist IDs of input artist list
    artist_ids = []
    for artist_name in artist_list:
        result = rate_limited_api_call(sp.search, q=artist_name, type='artist', limit=1)
        if result and result['artists']['items']:
            artist_ids.append(result['artists']['items'][0]['id'])

    rankings = {}
    
    for artist_id in artist_ids:
        albums = []
        results = rate_limited_api_call(sp.artist_albums, artist_id=artist_id, album_type='album', limit=15)
        albums.extend(results['items'])

        all_tracks = []
        if len(albums) < 3:
            sample_size = 15

        for album in albums:
            album_id = album['id']
            tracks = rate_limited_api_call(sp.album_tracks, album_id)['items']
            
            # Ensure this is a list and has enough tracks
            if isinstance(tracks, list) and len(tracks) > 0:
                sampled_tracks = random.sample(tracks, min(sample_size, len(tracks)))
                all_tracks.extend(sampled_tracks)

        artist_rankings = {}

        try:
            input_track_features = rate_limited_api_call(sp.audio_features, track_id)[0]
        except spotipy.exceptions.SpotifyException as e:
            if e.http_status == 429:  # Too Many Requests
                retry_after = int(e.headers.get('Retry-After', 5))
                print(f"Rate limit exceeded. Retrying after {retry_after} seconds.")
                time.sleep(retry_after)
                input_track_features = rate_limited_api_call(sp.audio_features, track_id)[0]

        input_track_features["tempo"] = np.clip(np.interp(input_track_features["tempo"], [0, 200], [0, 1]), 0, 1)

        # Normalize key data 
        input_track_features["key"] = np.interp(input_track_features["key"], [-1, 11], [0, 1])

        # Normalize loudness
        input_track_features["loudness"] = np.clip(np.interp(input_track_features["loudness"], [-60, 0], [0, 1]), 0, 1)

        # Normalize time signatures
        input_track_features["time_signature"] = np.interp(input_track_features["time_signature"], [3, 7], [0, 1])


        
        for track in all_tracks:
            try:
                track_features = rate_limited_api_call(sp.audio_features, track["id"])[0]
            except spotipy.exceptions.SpotifyException as e:
                if e.http_status == 429:  # Too Many Requests
                    retry_after = int(e.headers.get('Retry-After', 5))
                    print(f"Rate limit exceeded. Retrying after {retry_after} seconds.")
                    time.sleep(retry_after)
                    track_features = rate_limited_api_call(sp.audio_features, track["id"])[0]

            if track_features is not None:  # Check if audio features were retrieved
                similarity = compute_similarity(input_track_features, track_features, filters)
                artist_rankings[track['id']] = similarity

        # Sort and update rankings
        artist_rankings = dict(sorted(artist_rankings.items(), key=lambda item: item[1], reverse=True))
        
        for track_id, similarity in list(artist_rankings.items())[:count]:
            track = rate_limited_api_call(sp.track, track_id)
            rankings[track_id] = [track["name"], track['artists'][0]['name'], similarity, track['album']['images'][0]['url']]

    # Return only the top `count` rankings
    return dict(sorted(rankings.items(), key=lambda item: item[1][1], reverse=True)[:count])