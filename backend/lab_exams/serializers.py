from rest_framework import serializers
from .models import LabExam


class LabExamSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LabExam
        fields = [
            'id', 'patient', 'patient_name', 'patient_email',
            'name', 'date', 'attachment', 'notes', 'uploaded_at', 'download_url'
        ]
        read_only_fields = ['id', 'uploaded_at', 'download_url']
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if obj.attachment and request:
            return request.build_absolute_uri(obj.attachment.url)
        return None

    def validate_patient(self, value):
        """
        Valida se o paciente pertence ao nutricionista logado.
        """
        request = self.context.get('request')
        if request and value.nutritionist != request.user:
            raise serializers.ValidationError(
                "Você só pode adicionar exames para seus pacientes."
            )
        return value