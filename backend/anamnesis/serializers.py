from rest_framework import serializers
from .models import Anamnesis, AnamnesisTemplate, AnamnesisResponse

from patients.models import PatientProfile

class AnamnesisSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(
        queryset=PatientProfile.objects.all(),
        required=False,
        allow_null=True
    )
    patient_name = serializers.CharField(source='patient.user.name', read_only=True)
    patient_email = serializers.EmailField(source='patient.user.email', read_only=True)
    progresso = serializers.IntegerField(source='get_progresso', read_only=True)

    class Meta:
        model = Anamnesis
        fields = '__all__'

class AnamnesisTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnamnesisTemplate
        fields = ['id', 'title', 'description', 'questions', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Set nutritionist from context
        validated_data['nutritionist'] = self.context['request'].user
        return super().create(validated_data)

class AnamnesisResponseSerializer(serializers.ModelSerializer):
    template_title = serializers.CharField(source='template.title', read_only=True)

    class Meta:
        model = AnamnesisResponse
        fields = ['id', 'patient', 'template', 'template_title', 'answers', 'filled_date', 'created_at']
        read_only_fields = ['id', 'filled_date', 'created_at']
