from rest_framework import serializers
from .models import Notification, NotificationSettings
import re
from patients.models import PatientProfile


class NotificationSerializer(serializers.ModelSerializer):
    patient_id = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    patient_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read', 
            'created_at', 'sent_at', 'patient_id', 'patient_name', 'patient_avatar'
        ]
        read_only_fields = ['id', 'created_at', 'sent_at']

    def _get_patient_id(self, obj):
        if not obj.message:
            return None
        # Procura por [PID:xxx] ou [ID:xxx]
        match = re.search(r'\[PID:(\d+)\]', obj.message) or re.search(r'\[ID:(\d+)\]', obj.message)
        if match:
            return match.group(1)
        return None

    def get_patient_id(self, obj):
        return self._get_patient_id(obj)

    def get_patient_name(self, obj):
        patient_id = self._get_patient_id(obj)
        if patient_id:
            try:
                patient = PatientProfile.objects.get(id=patient_id)
                return patient.user.name
            except PatientProfile.DoesNotExist:
                pass
        return None

    def get_patient_avatar(self, obj):
        patient_id = self._get_patient_id(obj)
        if patient_id:
            try:
                patient = PatientProfile.objects.get(id=patient_id)
                if hasattr(patient.user, 'profile') and patient.user.profile.profile_picture:
                    request = self.context.get('request')
                    if request:
                        return request.build_absolute_uri(patient.user.profile.profile_picture.url)
                    return patient.user.profile.profile_picture.url
            except PatientProfile.DoesNotExist:
                pass
        return None


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