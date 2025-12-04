from rest_framework import serializers
from .models import PatientProfile


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'nutritionist', 'birth_date', 'phone', 'address',
            'goal', 'service_type', 'start_date', 'created_at'
        ]
