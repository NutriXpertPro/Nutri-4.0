from rest_framework import serializers
from .models import Anamnesis


class AnamnesisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anamnesis
        fields = [
            'patient', 'weight', 'height', 'medical_conditions',
            'food_preferences', 'allergies', 'photo_url', 'created_at'
        ]
