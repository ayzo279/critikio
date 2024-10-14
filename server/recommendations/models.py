from django.db import models


class Recommendation(models.Model):
    # user_id = models.CharField(max_length=255)
    song_name = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)
    # filters = models.JSONField()
    recommended_songs = models.JSONField()
    # created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.song_name} by {self.artist_name}"