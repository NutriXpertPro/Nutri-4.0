from rest_framework import serializers
from .models import PatientProfile, PatientDiaryEntry, SocialLike, SocialComment


class PatientDiaryEntrySerializer(serializers.ModelSerializer):
    """
    Serializer para entradas no diário do paciente
    """
    patient_name = serializers.CharField(source='patient.user.name', read_only=True)
    
    class Meta:
        model = PatientDiaryEntry
        fields = [
            'id', 'patient', 'patient_name', 'entry_type', 'title', 'content',
            'photo', 'timestamp', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient', 'timestamp', 'created_at', 'updated_at']


class SocialLikeSerializer(serializers.ModelSerializer):
    """
    Serializer para curtidas
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = SocialLike
        fields = ['id', 'user', 'user_name', 'diary_entry', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class SocialCommentSerializer(serializers.ModelSerializer):
    """
    Serializer para comentários
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = SocialComment
        fields = ['id', 'user', 'user_name', 'diary_entry', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']