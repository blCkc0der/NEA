"""
URL configuration for stationerySystem project.

This file defines the main entry points for the backend, linking together all app-specific routes.
It uses Django's include() function to keep each app modular.

- Uses modular app routing structure (SOC - Separation of Concerns)
- Includes JWT-based token routes for secure authentication
"""

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse  # Used to return a simple HTML response
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # Get access and refresh token
    TokenRefreshView,      # Refresh access token using refresh token
    TokenVerifyView,       # Verify if token is valid
)

# Simple homepage (can be used for basic API check)
def home(request):
    return HttpResponse("Welcome to the Stationery System backend")

urlpatterns = [
    # Django admin route
    path('admin/', admin.site.urls),

    # JWT Authentication endpoints (Token-based Auth)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Modular API Routing for each app
    path('api/inventory/', include('inventory.urls')),  # Inventory module
    path('api/requests/', include('requests.urls')),    # Request handling
    path('api/users/', include('users.urls')),          # User registration/login
    path('api/', include('notifications.urls')),        # Notifications   
    path('api/', include('reports.urls')),              # Report generation
]

