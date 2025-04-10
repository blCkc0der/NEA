from django.db import models
from django.conf import settings # To link to your User model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone # Added for default timestamp if needed

class Notification(models.Model):
    """
    Model to store notifications for users.
    Uses GenericForeignKey to link to different related models (e.g., Item, Request).
    """
    # Define choices for the type of notification
    class NotificationType(models.TextChoices):
        LOW_STOCK = 'LOW_STOCK', 'Low Stock' # For manager or teacher
        NEW_REQUEST = 'NEW_REQUEST', 'New Request' # For manager
        REQUEST_STATUS = 'REQUEST_STATUS', 'Request Status Change' # For teacher
        # Add any other types you might need, e.g., 'ITEM_ASSIGNED', 'SYSTEM_MESSAGE'

    # Who should receive this notification?
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications' # Allows user.notifications.all()
    )

    # The content of the notification message
    message = models.TextField()

    # What kind of notification is this?
    notification_type = models.CharField(
        max_length=50, # Increased length slightly for flexibility
        choices=NotificationType.choices
    )

    # Has the recipient read this notification?
    is_read = models.BooleanField(default=False, db_index=True) # Index for faster filtering

    # When was the notification created?
    timestamp = models.DateTimeField(default=timezone.now, db_index=True) # Index for ordering

    # --- Generic Foreign Key to link to the related object ---
    # Stores the model type (e.g., InventoryItem, Request)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True, blank=True # Allow notifications without a direct object link
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
        ordering = ['-timestamp'] # Show newest notifications first
        indexes = [
            # Combined index for common query: unread notifications for a user
            models.Index(fields=['recipient', 'is_read', '-timestamp']),
        ]

    def __str__(self):
        read_status = "Read" if self.is_read else "Unread"
        return f"To {self.recipient.email}: {self.message[:40]}... ({read_status})" # Assuming user model has email

