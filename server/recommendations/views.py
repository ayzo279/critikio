from django.shortcuts import render
import spotipy
import numpy as np
from spotipy.oauth2 import SpotifyClientCredentials
import os

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Recommendation
from .serializers import RecommendationSerializer

from .views_helper import *

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

        rec_list = get_recommendations(referenceTrack, referenceArtist, artists, filters)

        # print(rec_list)
        
        recommendation = Recommendation(
            referenceTrack=referenceTrack,
            referenceArtist=referenceArtist,
            recommended_songs=rec_list
        )
        recommendation.save()

        serializer = RecommendationSerializer(recommendation)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

def get_recommendations(song, artist, artist_list, filters, count=5):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))


    # Search for the input song to get its track ID
    search_query = f"track:{song} artist:{artist}"
    result = rate_limited_api_call(sp.search, q=search_query, type='track', limit=1)

    # Get Track ID of input song
    if not result or not result['tracks']['items']:
        return []  # Return an empty dict if song not found

    track_id = result['tracks']['items'][0]['id']
    
    # Store artist IDs of input artist list
    artist_ids = []
    for artist_name in artist_list:
        result = rate_limited_api_call(sp.search, q=artist_name, type='artist', limit=1)
        if result and result['artists']['items']:
            artist_ids.append(result['artists']['items'][0]['id'])

    rankings = {}
    recommendations = []
    
    try:
        input_track_features = rate_limited_api_call(sp.audio_features, track_id)[0]
    except spotipy.exceptions.SpotifyException as e:
        if e.http_status == 429:  # Too Many Requests
            print("Rate limit exceeded. Try again later")
            return []
            
    # Normalize features
    input_track_features["tempo"] = np.clip(np.interp(input_track_features["tempo"], [0, 200], [0, 1]), 0, 1)
    input_track_features["key"] = np.interp(input_track_features["key"], [-1, 11], [0, 1])
    input_track_features["loudness"] = np.clip(np.interp(input_track_features["loudness"], [-60, 0], [0, 1]), 0, 1)
    input_track_features["time_signature"] = np.interp(input_track_features["time_signature"], [3, 7], [0, 1])

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
            all_tracks.extend(tracks)

        artist_rankings = {}

        batched_tracks = batch_process(all_tracks)
        for batch in batched_tracks:
            try:
                track_features = rate_limited_api_call(sp.audio_features, [track["id"] for track in batch])
            except spotipy.exceptions.SpotifyException as e:
                if e.http_status == 429:  # Too Many Requests
                    print("Rate limit exceeded. Try again later")
                    return []
            if track_features is not None:
                for i in range(len(track_features)):
                    similarity = compute_similarity(input_track_features, track_features[i], filters)
                    artist_rankings[batch[i]['id']] = similarity

        # Sort & update rankings and retrieve top `count` tracks
        artist_rankings = sorted(artist_rankings.items(), key=lambda item: item[1], reverse=True)[:count]
        
        for track_id, similarity in artist_rankings:
            rankings[track_id] = similarity

    rankings = sorted(rankings.items(), key=lambda item: item[1], reverse=True)[:count]
    tracks_info = rate_limited_api_call(sp.tracks, [track_id for track_id in rankings.keys()])
    for track in tracks_info:
        recommendations.append([track['id'], track['artists'][0]['name'], rankings[track['id']], track['album']['images'][0]['url']])

    return recommendations

def get_global_recs(song, artist, filters, count=5):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))
    
    hot100_id = "6UeSakyzhiEt4NB3UAd6NQ"
    global_tracks = rate_limited_api_call(sp.playlist_tracks, hot100_id)
    search_query = f"track:{song} artist:{artist}"

    result = rate_limited_api_call(sp.search, q=search_query, type='track', limit=1)

    # # Get Track ID of input song
    if not result or not result['tracks']['items']:
        return []  # Return an empty dict if song not found

    track_id = result['tracks']['items'][0]['id']
    # print(sp.audio_features(track_id))
    try:
        input_track_features = rate_limited_api_call(sp.audio_features, track_id)[0]
    except spotipy.exceptions.SpotifyException as e:
        if e.http_status == 429:  # Too Many Requests
            print("Rate limit exceeded. Try again later")
            return []

    print(input_track_features)
    # # Normalize features
    # input_track_features["tempo"] = np.clip(np.interp(input_track_features["tempo"], [0, 200], [0, 1]), 0, 1)
    # input_track_features["key"] = np.interp(input_track_features["key"], [-1, 11], [0, 1])
    # input_track_features["loudness"] = np.clip(np.interp(input_track_features["loudness"], [-60, 0], [0, 1]), 0, 1)
    # input_track_features["time_signature"] = np.interp(input_track_features["time_signature"], [3, 7], [0, 1])

    # try:
    #     global_features = rate_limited_api_call(sp.audio_features, global_tracks)
    # except spotipy.exceptions.SpotifyException as e:
    #     if e.http_status == 429:  # Too Many Requests
    #         print("Rate limit exceeded. Try again later")
    #         return []
    
    # rankings = {}
    # recommendations = []
    
    # for track in global_features:
    #     rankings[track['id']] = compute_similarity(input_track_features, track, filters)

    # rankings = sorted(rankings.items(), key=lambda item: item[1], reverse=True)[:count]
    # tracks_info = rate_limited_api_call(sp.tracks, [track_id for track_id in rankings.keys()])
    # for track in tracks_info:
    #     recommendations.append([track['id'], track['artists'][0]['name'], rankings[track['id']], track['album']['images'][0]['url']])

    # return recommendations

    
def test_api():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))

    track = sp.playlist_tracks("6UeSakyzhiEt4NB3UAd6NQ")
    print(track)



