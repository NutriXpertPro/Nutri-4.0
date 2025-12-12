from rest_framework import serializers
from .models import Appointment
from patients.models import PatientProfile


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_email',
            'date', 'duration', 'type', 'status', 'meeting_link', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_patient(self, value):
        """
        Valida se o paciente pertence ao nutricionista logado.
        """
        request = self.context.get('request')
        if request and value.nutritionist != request.user:
            raise serializers.ValidationError(
                "Você só pode agendar consultas para seus pacientes."
            )
        return value