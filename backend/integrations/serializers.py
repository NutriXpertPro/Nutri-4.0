from rest_framework import serializers
from .models import GoogleCalendarIntegration, GoogleCalendarEvent


class GoogleCalendarIntegrationSerializer(serializers.ModelSerializer):
    """
    Serializer para integração com Google Calendar
    """
    class Meta:
        model = GoogleCalendarIntegration
        fields = [
            'id',
            'user',
            'google_user_id',
            'google_email',
            'google_display_name',
            'is_active',
            'default_calendar_id',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'user',
            'google_user_id',
            'google_email',
            'google_display_name',
            'created_at',
            'updated_at'
        ]


class GoogleCalendarEventSerializer(serializers.ModelSerializer):
    """
    Serializer para eventos sincronizados com Google Calendar
    """
    class Meta:
        model = GoogleCalendarEvent
        fields = [
            'id',
            'appointment',
            'google_event_id',
            'google_calendar_id',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']