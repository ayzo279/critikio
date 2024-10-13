from django.shortcuts import render
import time
import spotipy
import numpy as np
from spotipy.oauth2 import SpotifyClientCredentials
import os
import random

# Compute normalized Euclidean distance
def compute_similarity(song1, song2, filters: dict[str, bool]):
    similarity = 0
    defaults = ["tempo"]

    # Normalize tempo data between 0 and 1
    song1["tempo"] = np.interp(song1["tempo"], [0, 200], [0, 1])
    song2["tempo"] = np.interp(song2["tempo"], [0, 200], [0, 1])

    # Calculate similarity using default features
    for default_feature in defaults:
        similarity += (song1[default_feature] - song2[default_feature]) ** 2

    # Include selected features based on filters
    for feature in filters.keys():
        if filters[feature]:
            similarity += (song1[feature] - song2[feature]) ** 2

    # Return the square root of the summed differences (Euclidean distance)
    return np.sqrt(similarity)

def get_recommendations(song, artist, artist_list, filters, count=5):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sample_size = 5
    
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
            rankings[track_id] = similarity

    # Return only the top `count` rankings
    return dict(sorted(rankings.items(), key=lambda item: item[1])[:count])
