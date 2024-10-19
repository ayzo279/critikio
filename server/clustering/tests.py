from django.test import TestCase
from django.conf import settings
from django.urls import reverse
from unittest.mock import patch

from dotenv import load_dotenv
import os
from clustering.views import build_song_clusters
from clustering.views_helper import build_clusters

load_dotenv()

class ClusteringTestCase(TestCase):

    def setUp(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

    # def test_build_cluster(self):
    #     songs = [
    #         {"danceability": 0.2, "energy": 0.5, "tempo": 0.9},
    #         {"danceability": 0.1, "energy": 0.2, "tempo": 0.4},
    #         {"danceability": 0.6, "energy": 0.7, "tempo": 0.8},
    #         {"danceability": 0.3, "energy": 0.3, "tempo": 0.4},
    #         {"danceability": 0.9, "energy": 0.9, "tempo": 0.1}
    #         ]
    #     filters = {
    #         "danceability": True,
    #         "energy": False,
    #         "tempo": True
    #     }
    #     clusters = build_clusters(songs, filters)
    #     assert(len(clusters) == 3)

    # def test_build_song_cluster(self):
    #     artists=["Benson Boone", "Gracie Abrams"]
    #     filters = {
    #         "danceability": True,
    #         "energy": False,
    #         "tempo": True
    #     }
    #     clusters = build_song_clusters(artists, filters)
    #     for cluster in clusters:
    #         print(cluster)
    #         print('\n')

