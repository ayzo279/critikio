from django.db import models


class Recommendation(models.Model):
    # user_id = models.CharField(max_length=255)
    referenceTrack = models.CharField(max_length=255)  # For referenceTrack
    referenceArtist = models.CharField(max_length=255)  # For referenceArtist
    toggles = models.JSONField()  # To store toggles as a dictionary
    badges = models.JSONField()  # Assuming you're using Django 3.1+ for the JSONField to store lists
    song_name = models.CharField(max_length=255, null=True)  # For song_name
    artist_name = models.CharField(max_length=255, null=True)  # For artist_name
    recommended_songs = models.JSONField(null=True)  # For a list of recommended songs
    # created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.song_name} by {self.artist_name}"