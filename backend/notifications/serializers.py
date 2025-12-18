from rest_framework import serializers
from .models import Notification, NotificationSettings


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'sent_at']
        read_only_fields = ['id', 'created_at', 'sent_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            'id', 'user', 'notify_appointment_reminder', 'notify_diet_expiry',
            'notify_new_message', 'notify_system', 'notify_payment',
            'email_notifications', 'push_notifications', 'in_app_notifications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

    def update(self, instance, validated_data):
        # Atualiza apenas os campos fornecidos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance