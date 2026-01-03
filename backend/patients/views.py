from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import models
from .models import PatientProfile
from .serializers import PatientProfileSerializer
from rest_framework.pagination import PageNumberPagination


class PatientListView(generics.ListCreateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        user = self.request.user
        queryset = PatientProfile.objects.filter(nutritionist=user, is_active=True)
        
        search_query = self.request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(
                models.Q(user__name__icontains=search_query) | 
                models.Q(user__email__icontains=search_query)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(nutritionist=self.request.user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PatientProfile.objects.filter(nutritionist=self.request.user, is_active=True)

    def perform_destroy(self, instance):
        from notifications.models import Notification
        
        # 1. Remover notificações associadas a este paciente
        # O padrão da mensagem é "... [PID:{id}]"
        # Usamos icontains para garantir, mas o formato é específico
        Notification.objects.filter(
            user=self.request.user,
            message__contains=f"[PID:{instance.id}]"
        ).delete()

        # 2. Verificar se é Hard Delete (exclusão permanente)
        hard_delete = self.request.query_params.get('hard_delete', 'false').lower() == 'true'

        if hard_delete:
            instance.delete()
        else:
            instance.is_active = False
            instance.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compare_photos_view(request, pk):
    """
    Retorna a primeira e última avaliação fotográfica do paciente para comparação.
    """
    patient = get_object_or_404(PatientProfile, pk=pk, nutritionist=request.user)

    # Obter todas as avaliações com fotos
    evaluations = patient.evaluations.order_by('date').prefetch_related('photos')

    if not evaluations.exists():
        return Response({
            "message": "Nenhuma avaliação com fotos encontrada para este paciente."
        }, status=status.HTTP_404_NOT_FOUND)

    # Primeira e última avaliação
    first_evaluation = evaluations.first()
    last_evaluation = evaluations.last()

    def get_photo_urls(evaluation):
        """Helper para pegar URLs das fotos de uma avaliação."""
        photos = {}
        for photo in evaluation.photos.all():
            label = photo.get_label_display().lower()
            photos[label] = photo.image.url if photo.image else None
        return photos

    # Preparar dados para resposta
    response_data = {
        "first_evaluation": {
            "date": first_evaluation.date,
            "photos": get_photo_urls(first_evaluation),
            "weight": first_evaluation.weight,
            "body_fat": first_evaluation.body_fat,
            "muscle_mass": first_evaluation.muscle_mass,
        },
        "latest_evaluation": {
            "date": last_evaluation.date,
            "photos": get_photo_urls(last_evaluation),
            "weight": last_evaluation.weight,
            "body_fat": last_evaluation.body_fat,
            "muscle_mass": last_evaluation.muscle_mass,
        },
        "progress": {
            "weight_change": None,
            "body_fat_change": None,
            "muscle_mass_change": None,
            "has_improvement": False,
        }
    }

    # Calcular diferenças se ambas avaliações tiverem os dados
    if first_evaluation.weight is not None and last_evaluation.weight is not None:
        response_data["progress"]["weight_change"] = float(last_evaluation.weight - first_evaluation.weight)

    if first_evaluation.body_fat is not None and last_evaluation.body_fat is not None:
        response_data["progress"]["body_fat_change"] = float(last_evaluation.body_fat - first_evaluation.body_fat)

    if first_evaluation.muscle_mass is not None and last_evaluation.muscle_mass is not None:
        response_data["progress"]["muscle_mass_change"] = float(last_evaluation.muscle_mass - first_evaluation.muscle_mass)

    # Determinar se houve melhoria (simplificação: melhoria é perda de gordura e ganho de músculo)
    bf_change = response_data["progress"]["body_fat_change"]
    mm_change = response_data["progress"]["muscle_mass_change"]

    if bf_change is not None and mm_change is not None:
        response_data["progress"]["has_improvement"] = bf_change < 0 and mm_change > 0

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_search_view(request):
    """
    Searches for patients by name for autocomplete functionality.
    """
    query = request.query_params.get('q', '').strip()
    
    if len(query) < 2: # Don't search for very short strings
        return Response([])

    patients = PatientProfile.objects.filter(
        nutritionist=request.user,
        user__name__icontains=query
    ).select_related('user')[:10] # Limit to 10 results

    # Return a simplified structure for the autocomplete component
    results = [
        {
            "id": patient.id, 
            "name": patient.user.name,
            "avatar": request.build_absolute_uri(patient.user.profile.profile_picture.url) if patient.user.profile.profile_picture else None
        }
        for patient in patients
    ]
    
    return Response(results)