from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'message', 'sent_at', 'is_read'
        ]
        read_only_fields = ['id', 'sent_at']