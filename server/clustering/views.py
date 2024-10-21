from django.shortcuts import render
import spotipy
import numpy as np
import random
from spotipy.oauth2 import SpotifyClientCredentials
import os

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Cluster
from .serializers import ClusteringSerializer

from .views_helper import *

# Create your views here.
class ClusteringViewSet(viewsets.ModelViewSet):
    queryset = Cluster.objects.all()
    serializer_class = ClusteringSerializer

    def create(self, request, *args, **kwargs):
        return self.process_cluster(request)
    
    @action(detail=False, methods=['post'])
    def process_cluster(self, request): 
        filters = request.data.get('toggles', {})
        artists = request.data.get('artists', [])
        sampling_size = request.data.get('samplingSize', "")
        if sampling_size == "All":
            sampling_size = 100
        else:
            sampling_size = int(sampling_size)

        clusters = build_song_clusters(artists, filters, sampling_size)
        cluster_recs = Cluster(
            artists=artists,
            toggles=filters,
            clusters=clusters,
            samplingSize = sampling_size
        )
        cluster_recs.save()

        serializer = ClusteringSerializer(cluster_recs)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
def build_song_clusters(artists, filters, sampling_size):
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))

    artist_ids = []
    for artist_name in artists:
        result = rate_limited_api_call(sp.search, q=artist_name, type='artist', limit=1)
        if result and result['artists']['items']:
            artist_ids.append(result['artists']['items'][0]['id'])

    all_tracks = []
    for artist_id in artist_ids:
        albums = []
        results = rate_limited_api_call(sp.artist_albums, artist_id=artist_id, album_type='album', limit=15)
        albums.extend(results['items'])

        for album in albums:
            album_id = album['id']
            tracks = rate_limited_api_call(sp.album_tracks, album_id)['items']
            num_tracks_to_sample = min(len(tracks), max(1, sampling_size // len(albums))) if albums else 0
            if num_tracks_to_sample > 0:
                sampled_tracks = random.sample(tracks, num_tracks_to_sample)
                all_tracks.extend(sampled_tracks)

    batched_tracks = batch_process(all_tracks)
    track_features = []
    for batch in batched_tracks:
        try:
            track_features.extend(rate_limited_api_call(sp.audio_features, [track["id"] for track in batch]))
        except spotipy.exceptions.SpotifyException as e:
            if e.http_status == 429:  # Too Many Requests
                print("Rate limit exceeded. Try again later")
                return []
            
    clusters = build_clusters(track_features, filters)
    final_clusters = []
    dupe_checker = set()
    for cluster in clusters:
        track_ids = [track["id"] for track in cluster]
        tracks_info = rate_limited_api_call(sp.tracks, track_ids)
        cluster_tracks = []
        for track in tracks_info['tracks']:
            if track['name'] in dupe_checker:
                continue
            else:
                cluster_tracks.append(track['name'])
                dupe_checker.add(track['name'])
            
        final_clusters.append(cluster_tracks)
            # recommendations.append([track['name'], track['artists'][0]['name'], rankings[track['id']], track['album']['images'][0]['url'], track['id']])

    return final_clusters
    