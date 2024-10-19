from rest_framework import serializers
from .models import Cluster

class ClusteringSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cluster
        fields = '__all__'
