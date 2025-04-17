from django.db import models
from inventory.models import InventoryItem   # Link to inventory items
from django.contrib.auth import get_user_model

User = get_user_model()

class Request(models.Model):
    # Constants for request status values
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    
    # Predefined status choices
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
    ]

    # Foreign key links request to a specific item in inventory
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)

    # Quantity of items requested
    quantity = models.PositiveIntegerField()

    # Request status 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    # Link to the user who made the request
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='requests_made',
        null=True,  # Temporarily nullable  
        blank=True
    )

     # Optional link to the stock manager who reviews/approves the request
    stock_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requests_managed'
    )

    # Optional message or note from teacher or manager
    notes = models.TextField(blank=True, null=True)

     # Automatically records request creation timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
         # Sorts requests so that newest appear first
        ordering = ['-created_at']

    def __str__(self):
        # Readable string representation for debugging/admin
        return f"{self.item.name} - {self.quantity} ({self.status})"