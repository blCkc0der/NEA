from django.db import models
from django.conf import settings   # To reference the custom User model
from django.contrib.contenttypes.fields import GenericForeignKey    # For dynamic relations
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone    # Used for default timestamps

class Notification(models.Model):
    """
    Model to store notifications for users.
    Uses GenericForeignKey to link to different related models (e.g., Item, Request).
    """
     # Object-oriented programming + use of built-in polymorphic relationships

     # Define notification types for filtering and UI display
    class NotificationType(models.TextChoices):
        LOW_STOCK = 'LOW_STOCK', 'Low Stock' # Triggered when stock is below threshold
        NEW_REQUEST = 'NEW_REQUEST', 'New Request' # Teacher submits request
        REQUEST_STATUS = 'REQUEST_STATUS', 'Request Status Change' # Request approved or rejected
        # Add any other types you might need, e.g., 'ITEM_ASSIGNED', 'SYSTEM_MESSAGE'

     # Recipient of the notification
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications' # Allows user.notifications.all()
    )

    # The content of the notification message
    message = models.TextField()

   # Type of notification (based on NotificationType choices)
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices
    )

   # Whether the user has seen this notification
    is_read = models.BooleanField(default=False, db_index=True) # Index for faster filtering

    # When the notification was created
    timestamp = models.DateTimeField(default=timezone.now, db_index=True) # Index for ordering

    # ---- Generic relation to allow linking to any object ---- 
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True, 
        blank=True # Allow notifications without a direct object link
    )

    # Stores the primary key of the related object
    object_id = models.PositiveIntegerField(null=True, blank=True)

    # The actual related object (combines content_type and object_id)
    content_object = GenericForeignKey('content_type', 'object_id')
    # --- End Generic Foreign Key ---

    # Optional: Store a direct *frontend* link for easy navigation when clicked
    # Example: '/inventory/123' or '/requests/45'
    link = models.CharField(max_length=500, blank=True, null=True)

    class Meta:
        ordering = ['-timestamp'] # sort newest first
        indexes = [
             # Optimize for unread-notifications lookup
            models.Index(fields=['recipient', 'is_read', '-timestamp']),
        ]

    def __str__(self):
        # Defensive programming: truncate message to avoid log clutter
        read_status = "Read" if self.is_read else "Unread"
        return f"To {self.recipient.email}: {self.message[:40]}... ({read_status})" # Assuming user model has email

