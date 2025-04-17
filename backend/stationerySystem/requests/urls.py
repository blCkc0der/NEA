from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import RequestViewSet

# Set up a router to automatically generate routes for the RequestViewSet
router = DefaultRouter()

# Registers standard CRUD endpoints for the RequestViewSet at the /requests/ endpoint
router.register(r'requests', RequestViewSet, basename='requests')

urlpatterns = [
    # Include the auto-generated URL patterns in the final URLConf
    path('', include(router.urls)),
]