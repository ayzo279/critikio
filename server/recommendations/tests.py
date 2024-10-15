from django.test import TestCase
from django.conf import settings
from django.urls import reverse
from unittest.mock import patch

from dotenv import load_dotenv
import os
from recommendations.views import compute_similarity, get_recommendations

load_dotenv()

class RecommendationsTestCase(TestCase):

    def setUp(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

            
    def test_compute_similarity(self):
        song1 = {
            "tempo": 120,
            "acousticness": 0.5,
            "key": 5,
            "mode": 0,
            "liveness": 0.5,
            "loudness": -10.0,
            "time_signature": 4,
            "danceability": 0.5,
            "valence": 0.8,
            "energy": 0.84,
            "speechiness": 0.1
        }

        song2 = {
            "tempo": 100,
            "acousticness": 0.2,
            "key": 6,
            "mode": 1,
            "liveness": 0.9,
            "loudness": -20.0,
            "time_signature": 6,
            "danceability": 0.2,
            "valence": 0.7,
            "energy": 0.94,
            "speechiness": 0.2
        }

        filters = {
            "danceability": True,
            "valence": False
        }

        similarity = compute_similarity(song1, song2, filters)

        self.assertIsInstance(similarity, float)
        self.assertLessEqual(similarity, 1.0)

    def test_get_recommendations(self):
        song = "Roxanne"
        artist = "The Police"
        artist_list = ["Bruno Mars"]
        filters = {
            "danceability": True,
            "valence": True
        }

        recommendations = get_recommendations(song, artist, artist_list, filters, count=3)
        self.assertIsInstance(recommendations, dict)
        self.assertLessEqual(len(recommendations), 3)

    # @patch('recommendations.views.get_recommendations')  # Adjust path if necessary
    def test_process_recommendations_success(self):
        # Mock the return value of get_recommendations
        reference_track = "Shape of You"
        reference_artist = "Ed Sheeran"
        filters = {"danceability":True, "energy":True}
        artists = ["Benson Boone"]

        recommended_songs = get_recommendations(reference_track, reference_artist, artists, filters)

        rec_list = [song for song in recommended_songs.values()]

        print(rec_list)

