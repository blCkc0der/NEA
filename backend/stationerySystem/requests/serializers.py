from rest_framework import serializers
from inventory.models import InventoryItem  
from .models import Request
from inventory.serializers import InventoryItemSerializer
from django.db import transaction       # Group A: Used for safe multi-step updates
from inventory.serializers import InventoryItemSerializer
from django.db import transaction
from users.models import User, TeacherProfile, Class
from users.serializers import UserSerializer, TeacherProfileSerializer


class RequestSerializer(serializers.ModelSerializer):
     # Nested serializer for read-only item details
    item = InventoryItemSerializer(read_only=True)

    # This handles writing the foreign key reference via ID
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),  
        source='item',
        write_only=True
    )

    # Include read-only user info and teacher profile for display purposes
    user = UserSerializer(read_only=True)
    teacher_profile = TeacherProfileSerializer(source='user.teacher_profile', read_only=True)

    class Meta:
        model = Request
        fields = [
            'id', 'item', 'item_id', 'quantity', 'status', 'notes', 'created_at',
            'user', 'teacher_profile']
        read_only_fields = ['status', 'created_at']    # Prevent client from modifying these directly
    
    def update(self, instance, validated_data):
        """
        Custom update method that deducts inventory if a request is approved.
        """

         # Get new status from request (if changing)
        new_status = validated_data.get('status', instance.status)
        
        # Atomic transaction to ensure data consistency
        with transaction.atomic():
            # First update the request status
            instance = super().update(instance, validated_data)
            
            # If approved, deduct from inventory
            if new_status == 'approved' and instance.item and instance.quantity:
                inventory_item = instance.item
                if inventory_item.quantity < instance.quantity:
                    raise serializers.ValidationError(
                        {"quantity": "Not enough items in inventory"}
                    )
                inventory_item.quantity -= instance.quantity
                inventory_item.save()
            
            return instance

class RequestUpdateSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer used for status-only updates (approve/reject).
    """
    class Meta:
        model = Request
        fields = ['status']