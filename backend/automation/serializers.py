from rest_framework import serializers
from .models import AutomationTemplate


class AutomationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationTemplate
        fields = [
            'id', 'name', 'trigger', 'content', 'is_active', 'delay_hours',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']