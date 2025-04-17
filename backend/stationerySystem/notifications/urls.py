from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import NotificationViewSet

# Router for auto-generating standard RESTful endpoints 
# router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

# === Additional custom URLs that aren't covered by the ViewSet === 
urlpatterns = [
    # Custom GET route to fetch number of unread notifications
    path('notifications/unread_count/', 
         NotificationViewSet.as_view({'get': 'unread_count'}), 
         name='notification-unread-count'),

    # Custom POST route to mark all notifications as read     
    path('notifications/mark_all_as_read/', 
         NotificationViewSet.as_view({'post': 'mark_all_as_read'}), 
         name='notification-mark-all-read'),

     # Custom GET route to retrieve only the most recent notifications
    path('notifications/recent/', 
         NotificationViewSet.as_view({'get': 'recent'}), 
         name='notification-recent'),
]

# Combine custom routes with RESTful routes from the router
urlpatterns += router.urls