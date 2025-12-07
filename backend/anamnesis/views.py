from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Anamnesis, AnamnesisTemplate, AnamnesisResponse
from .serializers import AnamnesisSerializer, AnamnesisTemplateSerializer, AnamnesisResponseSerializer

class AnamnesisViewSet(viewsets.ModelViewSet):
    """
    Standard Anamnesis (legacy/fixed model).
    OneToOne with Patient.
    """
    serializer_class = AnamnesisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter patients managed by this nutritionist
        return Anamnesis.objects.filter(patient__nutritionist=self.request.user)

    def perform_create(self, serializer):
        # Usually standard anamnesis is created with empty values or specifically attached
        serializer.save()

class AnamnesisTemplateViewSet(viewsets.ModelViewSet):
    """
    Custom Templates CRUD.
    """
    serializer_class = AnamnesisTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AnamnesisTemplate.objects.filter(nutritionist=self.request.user, is_active=True)

class AnamnesisResponseViewSet(viewsets.ModelViewSet):
    """
    Responses to custom anamnesis.
    """
    serializer_class = AnamnesisResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter responses involved with nutritionist's patients
        user = self.request.user
        queryset = AnamnesisResponse.objects.none()
        
        if user.user_type == 'nutricionista':
             queryset = AnamnesisResponse.objects.filter(patient__nutritionist=user)
        
        # Filter by specific patient if provided
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save()
