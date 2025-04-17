from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import RequestViewSet

router = DefaultRouter()
router.register(r'requests', RequestViewSet, basename='requests')

urlpatterns = [
    path('', include(router.urls)),
]