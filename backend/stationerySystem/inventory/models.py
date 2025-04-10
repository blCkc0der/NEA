from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

# Object-oriented model of data entities with field-level constraints.

# Represents the category of an inventory item 
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_custom = models.BooleanField(default=False)  # Allows distinguishing user-defined categories
    
    def __str__(self):
        return self.name

# Represents an inventory item in stock.
class InventoryItem(models.Model):
    STATUS_CHOICES = [
        ('in_stock', 'In Stock'),
        ('low_stock', 'Low Stock'),
        ('out_of_stock', 'Out of Stock'),
    ]

    # Item name must be unique to avoid duplication.
    name = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)    # Used to trigger low-stock alerts.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_stock')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Track quantity before update for logging
    _previous_quantity = None

    # Custom object instantiation method from DB
    @classmethod
    def from_db(cls, db, field_names, values):
        instance = super().from_db(db, field_names, values)
        # Store the original quantity when loaded from DB
        instance._previous_quantity = instance.quantity
        return instance

    def save(self, *args, **kwargs):
        """Update status based on quantity and threshold"""
        if self.quantity == 0:
            self.status = 'out_of_stock'
        elif self.quantity <= self.low_stock_threshold:
            self.status = 'low_stock'
        else:
            self.status = 'in_stock'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.category.name})"


# Tracks items assigned to teachers (used to monitor personal usage).
class TeacherInventoryItem(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='inventory_items'
    )
    item = models.ForeignKey(
        InventoryItem,
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )
    quantity = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent duplicate records for same teacher and item.
        unique_together = ('teacher', 'item')

    def clean(self):
        """
        Validates only teachers can be assigned items.
        - (Defensive programming and business logic enforcement.)
        """
        if self.teacher.role != 'teacher':
            raise ValidationError(
                f"Only teachers can have inventory items. User {self.teacher.email} has role '{self.teacher.role}'"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def status(self):
        """
        Returns dynamic stock status based on assigned quantity.
        - (Property-based logic abstraction.)
        """
        if self.quantity == 0:
            return 'out_of_stock'
        elif self.quantity <= self.item.low_stock_threshold:
            return 'low_stock'
        return 'in_stock'

    def __str__(self):
        return f"{self.teacher.email} - {self.item.name} ({self.quantity})"
    
# Group A: Complex table to log stock changes (like restocking, approvals).
class StockLog(models.Model):
    """Logs every change in stock quantity for an item."""
    item = models.ForeignKey(InventoryItem, related_name='stock_logs', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    change = models.IntegerField(help_text="Positive for stock in, negative for stock out/usage.")
    quantity_after_change = models.PositiveIntegerField()
    reason = models.CharField(max_length=255, blank=True, help_text="e.g., 'Request #ID Approved', 'Manual Update', 'Initial Count', 'Restock'")
    
    # Track which user made the change (admin/stock manager)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='stock_changes')
    
    # Optional: Link directly to the request if the change was due to one
    request = models.ForeignKey(
        'requests.Request', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='stock_log_entries')


    class Meta:
        ordering = ['-timestamp'] # Most recent first
        indexes = [
            models.Index(fields=['item', '-timestamp']),    # Indexed for query optimization
        ]

    def __str__(self):
        return f"{self.item.name} @ {self.timestamp.strftime('%Y-%m-%d %H:%M')}: {self.change:+} -> {self.quantity_after_change} ({self.reason})"