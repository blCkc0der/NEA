from rest_framework import serializers
from inventory.models import InventoryItem  # Add this import
from .models import Request
from inventory.serializers import InventoryItemSerializer
from django.db import transaction
from inventory.serializers import InventoryItemSerializer
from django.db import transaction
from users.models import User, TeacherProfile, Class
from users.serializers import UserSerializer, TeacherProfileSerializer


class RequestSerializer(serializers.ModelSerializer):
    item = InventoryItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),  
        source='item',
        write_only=True
    )

    user = UserSerializer(read_only=True)
    teacher_profile = TeacherProfileSerializer(source='user.teacher_profile', read_only=True)

    class Meta:
        model = Request
        fields = ['id', 'item', 'item_id', 'quantity', 'status', 'notes', 'created_at','user', 'teacher_profile']
        read_only_fields = ['status', 'created_at']
    def update(self, instance, validated_data):
        new_status = validated_data.get('status', instance.status)
        
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
    class Meta:
        model = Request
        fields = ['status']