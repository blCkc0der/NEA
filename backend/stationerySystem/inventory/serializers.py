from rest_framework import serializers
from .models import Category, InventoryItem, TeacherInventoryItem
from django.contrib.auth import get_user_model

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_custom']

class InventoryItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    
    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'category', 'category_id',
            'quantity', 'low_stock_threshold', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

class TeacherInventorySerializer(serializers.ModelSerializer):
    item = InventoryItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.all(),
        source='item',
        write_only=True
    )
    teacher = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='teacher'),
        default=serializers.CurrentUserDefault()
    )
    status = serializers.CharField(read_only=True)

    class Meta:
        model = TeacherInventoryItem
        fields = [
            'id', 'teacher', 'item', 'item_id', 
            'quantity', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

    def validate_teacher(self, value):
        if value.role != 'teacher':
            raise serializers.ValidationError("Only teachers can have inventory items")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['status'] = instance.status
        return data