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
        instance.is_active = False
        instance.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compare_photos_view(request, pk):
    return Response({"message": "Compare Photos API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)


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
        {"id": patient.id, "name": patient.user.name}
        for patient in patients
    ]
    
    return Response(results)