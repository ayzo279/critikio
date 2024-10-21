from django.contrib import admin
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from .views import ClusteringViewSet

router = DefaultRouter()
router.register(r'clustering', ClusteringViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
