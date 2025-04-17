from rest_framework import serializers
from .models import Notification
from django.contrib.contenttypes.models import ContentType
from django.conf import settings

# Custom serializer for any generic related object (dynamic content reference)
class ContentObjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField(source='_meta.model_name') # Uses model's name
    display = serializers.CharField(source='__str__')   # Uses model's string representation

class NotificationSerializer(serializers.ModelSerializer):
    # Dynamically return the related object data using SerializerMethodField
    content_object = serializers.SerializerMethodField()

    # Display the model name of the content type (e.g. 'request', 'inventoryitem')
    content_type_model = serializers.CharField(
        source='content_type.model',
        read_only=True
    )

    # Extract recipient's email directly for easier frontend use
    recipient_email = serializers.EmailField(
        source='recipient.email',
        read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'message',
            'is_read', 'timestamp', 'content_object',
            'content_type_model', 'object_id', 'link',
            'recipient_email'
        ]
        read_only_fields = ['timestamp']

    def get_content_object(self, obj):
        """
        Returns serialized details of the related object (if it exists).
        Supports polymorphic relation through GenericForeignKey.
        """
        if obj.content_object is None:
            return None
        return ContentObjectSerializer(obj.content_object).data

    def validate(self, data):
        """
        Validates the provided content_type and object_id:
        Ensures that the object exists and the content_type is valid.
        """
        # Advanced object lookup and validation logic
        if 'content_type' in data and 'object_id' in data:
            try:
                content_type = ContentType.objects.get(model=data['content_type'])
                model_class = content_type.model_class()
                if not model_class.objects.filter(id=data['object_id']).exists():
                    raise serializers.ValidationError(
                        {"object_id": "Referenced object does not exist"}
                    )
            except ContentType.DoesNotExist:
                raise serializers.ValidationError(
                    {"content_type": "Invalid content type"}
                )
        return data
