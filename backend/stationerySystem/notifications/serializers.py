from rest_framework import serializers
from .models import Notification
from django.contrib.contenttypes.models import ContentType
from django.conf import settings

class ContentObjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField(source='_meta.model_name')
    display = serializers.CharField(source='__str__')

class NotificationSerializer(serializers.ModelSerializer):
    content_object = serializers.SerializerMethodField()
    content_type_model = serializers.CharField(
        source='content_type.model',
        read_only=True
    )
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
        if obj.content_object is None:
            return None
        return ContentObjectSerializer(obj.content_object).data

    def validate(self, data):
        # Validate content object reference if provided
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
