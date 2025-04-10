from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from .models import Notification
from inventory.models import InventoryItem, TeacherInventoryItem
from requests.models import Request
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(pre_save, sender=InventoryItem)
def check_inventory_changes(sender, instance, **kwargs):
    """Track inventory changes for notifications"""
    if instance.pk:
        try:
            original = InventoryItem.objects.get(pk=instance.pk)
            if original.quantity != instance.quantity:
                instance._quantity_changed = True
                instance._previous_quantity = original.quantity
                instance._original_low_status = (original.quantity <= original.low_stock_threshold)
        except InventoryItem.DoesNotExist:
            pass

@receiver(post_save, sender=InventoryItem)
def notify_inventory_changes(sender, instance, created, **kwargs):
    """Send notifications for inventory changes"""
    if created:
        # Optionally notify about new items being added
        pass
    elif hasattr(instance, '_quantity_changed'):
        # Stock level changed
        current_low_status = (instance.quantity <= instance.low_stock_threshold)
        
        # Only notify if crossing the threshold in either direction
        if (current_low_status and not getattr(instance, '_original_low_status', False)) or \
           (not current_low_status and getattr(instance, '_original_low_status', False)):
            notify_low_stock(instance)
        
        # Notify assigned teachers if their stock is affected
        notify_teachers_about_stock_changes(instance)

def notify_low_stock(item):
    """Notify stock managers about low stock items"""
    stock_managers = User.objects.filter(role='stock_manager')
    content_type = ContentType.objects.get_for_model(item)

    for manager in stock_managers:
        Notification.objects.create(
            recipient=manager,
            notification_type=Notification.NotificationType.LOW_STOCK,
            message=f"{item.name} is running low. Current quantity: {item.quantity} (Threshold: {item.low_stock_threshold})",
            content_type=content_type,
            object_id=item.id,
            link=f"/inventory/{item.id}"
        )

def notify_teachers_about_stock_changes(item):
    """Notify teachers about changes to items they're assigned"""
    teacher_assignments = TeacherInventoryItem.objects.filter(item=item)
    content_type = ContentType.objects.get_for_model(item)

    for assignment in teacher_assignments:
        current_low_status = (assignment.quantity <= item.low_stock_threshold)
        
        # Check if we should notify this teacher
        if current_low_status and assignment.quantity > 0:
            Notification.objects.create(
                recipient=assignment.teacher,
                notification_type=Notification.NotificationType.LOW_STOCK,
                message=f"Your assigned {item.name} is running low. Current quantity: {assignment.quantity}",
                content_type=content_type,
                object_id=item.id,
                link=f"/teacher-inventory/{item.id}"
            )

@receiver(post_save, sender=Request)
def handle_request_notifications(sender, instance, created, **kwargs):
    """Handle notifications related to requests"""
    content_type = ContentType.objects.get_for_model(instance)

    if created:
        # New request notification for stock managers
        stock_managers = User.objects.filter(role='stock_manager')
        for manager in stock_managers:
            Notification.objects.create(
                recipient=manager,
                notification_type=Notification.NotificationType.NEW_REQUEST,
                message=f"New request for {instance.item.name} (Quantity: {instance.quantity})",
                content_type=content_type,
                object_id=instance.id,
                link=f"/requests/{instance.id}"
            )
    else:
        # Check if this is an update by fetching the original instance
        try:
            original = Request.objects.get(id=instance.id)
            # Compare current status with the original status
            if original.status != instance.status:
                if instance.status == Request.APPROVED:
                    Notification.objects.create(
                        recipient=instance.user,
                        notification_type=Notification.NotificationType.REQUEST_STATUS,
                        message=f"Your request for {instance.quantity} {instance.item.name} has been approved",
                        content_type=content_type,
                        object_id=instance.id,
                        link=f"/requests/{instance.id}"
                    )
                elif instance.status == Request.REJECTED:
                    Notification.objects.create(
                        recipient=instance.user,
                        notification_type=Notification.NotificationType.REQUEST_STATUS,
                        message=f"Your request for {instance.quantity} {instance.item.name} has been rejected",
                        content_type=content_type,
                        object_id=instance.id,
                        link=f"/requests/{instance.id}"
                    )
        except Request.DoesNotExist:
            # This shouldn't happen in post_save with created=False, but handle just in case
            pass

@receiver(post_save, sender=TeacherInventoryItem)
def notify_item_assignment(sender, instance, created, **kwargs):
    """Notify teachers when items are assigned to them"""
    if created:
        content_type = ContentType.objects.get_for_model(instance)
        Notification.objects.create(
            recipient=instance.teacher,
            notification_type=Notification.NotificationType.REQUEST_STATUS,
            message=f"You've been assigned {instance.quantity} {instance.item.name}",
            content_type=content_type,
            object_id=instance.id,
            link=f"/teacher-inventory/{instance.id}"
        )