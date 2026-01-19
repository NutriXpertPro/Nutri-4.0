from rest_framework import serializers
from .models import Evaluation, EvaluationPhoto, ExternalExam

class EvaluationPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = EvaluationPhoto
        fields = ['id', 'image', 'label', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

class EvaluationSerializer(serializers.ModelSerializer):
    photos = EvaluationPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = Evaluation
        fields = [
            'id', 'patient', 'date', 'method',
            'height', 'weight', 'body_fat', 'muscle_mass',
            'bmi', 'body_measurements', 'created_at', 'photos'
        ]
        read_only_fields = ['created_at', 'bmi']

    def validate_body_measurements(self, value):
        # Basic validation if needed, model already has validators
        return value


class ExternalExamSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_name = serializers.CharField(source='file_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)
    patient_name = serializers.CharField(source='patient.user.name', read_only=True)
    
    class Meta:
        model = ExternalExam
        fields = [
            'id', 'patient', 'patient_name', 'file', 'file_url', 'file_name',
            'file_type', 'notes', 'uploaded_at', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['uploaded_at', 'uploaded_by', 'file_type']
    
    def get_file_url(self, obj):
        """Retorna a URL completa do arquivo"""
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
    
    def create(self, validated_data):
        # Detectar tipo de arquivo automaticamente
        file = validated_data.get('file')
        if file:
            file_extension = file.name.split('.')[-1].upper()
            if file_extension == 'JPG':
                file_extension = 'JPEG'
            validated_data['file_type'] = file_extension
        
        # Definir o usuário que fez o upload
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        
        return super().create(validated_data)

