from django.contrib import admin
from django.urls import path
from .views import process_recommendations

urlpatterns = [
    path('api/recommendations/', process_recommendations, name='process-recommendations')
]
