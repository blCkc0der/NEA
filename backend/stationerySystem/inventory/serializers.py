from rest_framework import serializers
from .models import Category, InventoryItem, TeacherInventoryItem, StockLog
from django.contrib.auth import get_user_model
from django.db.models import Sum

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
    name = serializers.CharField(required=True, write_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        required=True
    )
    quantity = serializers.IntegerField(required=True, min_value=0)
    low_stock_threshold = serializers.IntegerField(required=True, min_value=0)
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = TeacherInventoryItem
        fields = [
            'id', 'teacher', 'item', 
            'name', 'category_id', 'quantity', 'low_stock_threshold',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'status', 'created_at', 'updated_at', 
            'teacher', 'item'
        ]

    def validate(self, data):
        if data['low_stock_threshold'] > data['quantity']:
            raise serializers.ValidationError(
                "Low stock threshold cannot be greater than quantity"
            )
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        
        if request.user.role != 'teacher':
            raise serializers.ValidationError("Only teachers can create inventory items")

        inventory_item = InventoryItem.objects.create(
            name=validated_data.pop('name'),
            category=validated_data.pop('category_id'),
            quantity=validated_data.pop('quantity'),
            low_stock_threshold=validated_data.pop('low_stock_threshold'),
            created_by=request.user
        )

        teacher_inventory = TeacherInventoryItem.objects.create(
            item=inventory_item,
            teacher=request.user,
            quantity=inventory_item.quantity
        )

        return teacher_inventory

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['item'] = {
            'id': instance.item.id,
            'name': instance.item.name,
            'category': {
                'id': instance.item.category.id,
                'name': instance.item.category.name,
                'is_custom': instance.item.category.is_custom
            },
            'quantity': instance.item.quantity,
            'low_stock_threshold': instance.item.low_stock_threshold,
            'status': instance.item.status
        }
        return data
    
# New serializer for stock report
class StockReportSerializer(serializers.ModelSerializer):
    usage = serializers.SerializerMethodField()
    status = serializers.CharField()

    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'quantity', 'usage', 'status']

    def get_usage(self, obj):
        # Calculate usage as sum of negative changes in StockLog
        start_date = self.context.get('start_date')
        end_date = self.context.get('end_date')
        queryset = StockLog.objects.filter(item=obj, change__lt=0)
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        total_usage = queryset.aggregate(total=Sum('change'))['total'] or 0
        return abs(total_usage)  # Return positive value for usage
