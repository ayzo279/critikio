from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from recommendations.views import RecommendationViewSet
from clustering.views import ClusteringViewSet

# Create routers for each app
recommendation_router = DefaultRouter()
recommendation_router.register(r'recommendations', RecommendationViewSet)

clustering_router = DefaultRouter()
clustering_router.register(r'clustering', ClusteringViewSet)

# Main URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(recommendation_router.urls)),  
    path('', include(clustering_router.urls)), 
]
