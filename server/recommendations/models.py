from django.db import models


class Recommendation(models.Model):
    # user_id = models.CharField(max_length=255)
    referenceTrack = models.CharField(max_length=255)
    referenceArtist = models.CharField(max_length=255)
    toggles = models.JSONField(default=dict)
    badges = models.JSONField(default=list, blank=True) 
    recommended_songs = models.JSONField(null=True)  
    # created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.song_name} by {self.artist_name}"