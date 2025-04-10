from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

# Additional custom URLs that aren't covered by the ViewSet
urlpatterns = [
    path('notifications/unread_count/', 
         NotificationViewSet.as_view({'get': 'unread_count'}), 
         name='notification-unread-count'),
    path('notifications/mark_all_as_read/', 
         NotificationViewSet.as_view({'post': 'mark_all_as_read'}), 
         name='notification-mark-all-read'),
    path('notifications/recent/', 
         NotificationViewSet.as_view({'get': 'recent'}), 
         name='notification-recent'),
]

# Include the router URLs
urlpatterns += router.urls