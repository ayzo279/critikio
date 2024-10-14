from django.test import TestCase
from django.conf import settings

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
            "danceability": 0.5,
            "valence": 0.8
        }

        song2 = {
            "tempo": 110,
            "danceability": 0.7,
            "valence": 0.2
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
        print(recommendations)
        self.assertIsInstance(recommendations, dict)
        self.assertLessEqual(len(recommendations), 3)
