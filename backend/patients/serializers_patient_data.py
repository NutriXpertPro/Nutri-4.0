from rest_framework import serializers
from .models_patient_data import (
    PatientMetric,
    MealCheckIn,
    ProgressPhoto,
    BodyMeasurement,
    AppointmentConfirmation,
    ClinicalNote,
    MealPhoto
)


class PatientMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMetric
        fields = ['id', 'date', 'calories_consumed', 'calories_goal', 
                  'water_consumed', 'water_goal', 'focus_score', 'focus_goal']
        read_only_fields = ['id', 'date']


class MealCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealCheckIn
        fields = ['id', 'meal', 'checked_in_at']
        read_only_fields = ['id', 'checked_in_at']


class ProgressPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressPhoto
        fields = ['id', 'angle', 'photo', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class BodyMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyMeasurement
        fields = ['id', 'date', 'waist', 'arms', 'legs', 'glutes', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']


class AppointmentConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentConfirmation
        fields = ['id', 'appointment', 'status', 'confirmed_at']
        read_only_fields = ['id', 'confirmed_at']


class ClinicalNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicalNote
        fields = ['id', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class MealPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPhoto
        fields = ['id', 'meal', 'photo', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
