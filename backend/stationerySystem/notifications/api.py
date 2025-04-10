from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from .models import Notification
from .serializers import NotificationSerializer
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]  # Allow anyone in development
    http_method_names = ['get', 'post', 'patch', 'delete']  # Disable PUT

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.select_related('recipient', 'content_type')

        if not user.is_authenticated:
            # In development, return all notifications if unauthenticated
            return Notification.objects.all()
        
        # Filter by recipient and add role-specific filters
        queryset = queryset.filter(recipient=user)
        
        # Role-based additional filtering
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
        
        # Handle recipient if not provided (default to current user)
        if 'recipient' not in data:
            data['recipient'] = user.id
        
        # Handle content object reference
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
        serializer.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"count": 0})
        
        count = Notification.objects.filter(recipient=user, is_read=False).count()
        return Response({"count": count})

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "success"})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"status": "success", "marked_read": 0})
        
        updated = Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
        return Response({"status": "success", "marked_read": updated})

    @action(detail=False, methods=['get'])
    def recent(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        recent_notifications = queryset[:10]  # Get last 10 notifications
        serializer = self.get_serializer(recent_notifications, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        # Only allow deleting notifications for the current user
        if self.request.user == instance.recipient:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"error": "You can only delete your own notifications"},
            status=status.HTTP_403_FORBIDDEN
        )