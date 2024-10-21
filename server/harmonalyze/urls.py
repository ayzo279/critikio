from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from recommendations.views import RecommendationViewSet
from clustering.views import ClusteringViewSet

# Create routers for each app
router = DefaultRouter()
router.register(r'recommendation', RecommendationViewSet)
router.register(r'clustering', ClusteringViewSet)

# Main URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(router.urls)),  # Include the single router
]
