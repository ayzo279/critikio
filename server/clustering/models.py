from django.db import models

# Create your models here.
class Cluster(models.Model):
    artists = models.JSONField(default=list)
    clusters = models.JSONField(default=list, null=True)
    toggles = models.JSONField(default=dict, null=True)
    samplingSize = models.CharField(max_length=255)