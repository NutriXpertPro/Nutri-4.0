from rest_framework import serializers
from .models import Evaluation, EvaluationPhoto

class EvaluationPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationPhoto
        fields = ['id', 'image', 'label', 'uploaded_at']
        read_only_fields = ['uploaded_at']

class EvaluationSerializer(serializers.ModelSerializer):
    photos = EvaluationPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Evaluation
        fields = [
            'id', 'patient', 'date', 'method', 
            'height', 'weight', 'body_fat', 'muscle_mass', 
            'body_measurements', 'created_at', 'photos'
        ]
        read_only_fields = ['created_at']

    def validate_body_measurements(self, value):
        # Basic validation if needed, model already has validators
        return value
