from rest_framework import viewsets, status
from rest_framework.decorators import action # Allows custom endpoints
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.contenttypes.models import ContentType # Used for dynamic linking to other models
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationViewSet(viewsets.ModelViewSet):
    """
    Handles viewing, creating, and updating user notifications.
    Includes custom endpoints for marking notifications read/unread.
    """
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]  # Allow anyone in development
    http_method_names = ['get', 'post', 'patch', 'delete']   # Restricts HTTP methods (excludes PUT)

    def get_queryset(self):
        """
        Returns notifications relevant to the current user's role.
        Teachers only see REQUEST_STATUS or LOW_STOCK.
        Managers/Admins see NEW_REQUEST or LOW_STOCK.
        """
        user = self.request.user
        queryset = Notification.objects.select_related('recipient', 'content_type')

        if not user.is_authenticated:
            # In development, return all notifications if unauthenticated
            return Notification.objects.all()
        
        queryset = queryset.filter(recipient=user)
        
         # Conditional query filtering based on user role
        if user.role == 'teacher':
            queryset = queryset.filter(
                Q(notification_type=Notification.NotificationType.REQUEST_STATUS) |
                Q(notification_type=Notification.NotificationType.LOW_STOCK)
            )
        elif user.role in ['stock_manager', 'admin']:
            queryset = queryset.filter(
                Q(notification_type=Notification.NotificationType.NEW_REQUEST) |
                Q(notification_type=Notification.NotificationType.LOW_STOCK)
            )
        
        return queryset.order_by('-timestamp')

    def create(self, request, *args, **kwargs):
        """
        Create a new notification, linking it generically to any content type if specified.
        """
        user = request.user
        if not user.is_authenticated:
            # Use a default user for development
            try:
                user = User.objects.first()
                if not user:
                    return Response(
                        {"error": "No users exist in the database for development"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": "Create at least one user for development"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        data = request.data.copy()
        
         # If no recipient provided, default to sender
        if 'recipient' not in data:
            data['recipient'] = user.id
        
        # Handle optional generic linking to content object
        if 'content_type' in data and 'object_id' in data:
            try:
                content_type = ContentType.objects.get(model=data['content_type'])
                data['content_type'] = content_type.id
            except ContentType.DoesNotExist:
                return Response(
                    {"error": "Invalid content type"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()   #Dynamic object persistence based on model context
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """
        Get count of unread notifications for the current user.
        """
        user = request.user
        if not user.is_authenticated:
            return Response({"count": 0})
        
        count = Notification.objects.filter(recipient=user, is_read=False).count()
        return Response({"count": count})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a single notification as read.
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "success"})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Mark all notifications as read for the current user.
        """
        user = request.user
        if not user.is_authenticated:
            return Response({"status": "success", "marked_read": 0})
        
        updated = Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
        return Response({"status": "success", "marked_read": updated})

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Return the 10 most recent notifications.
        """
        queryset = self.filter_queryset(self.get_queryset())
        recent_notifications = queryset[:10] # List slicing and sorting
        serializer = self.get_serializer(recent_notifications, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        """
        Only allow deleting notifications for the current user (defensive programming).
        """
        if self.request.user == instance.recipient:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"error": "You can only delete your own notifications"},
            status=status.HTTP_403_FORBIDDEN
        )