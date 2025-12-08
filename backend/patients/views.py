from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import models
from .models import PatientProfile
from .serializers import PatientProfileSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def patient_create(request):
    return Response({"message": "Create Patient API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def patient_list(request):
    if request.method == 'GET':
        # List patients for the logged-in nutritionist
        patients = PatientProfile.objects.filter(nutritionist=request.user)
        
        # Search filter
        search_query = request.query_params.get('search', '')
        if search_query:
            patients = patients.filter(
                models.Q(user__name__icontains=search_query) | 
                models.Q(user__email__icontains=search_query)
            )
            
        serializer = PatientProfileSerializer(patients, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Create new patient
        serializer = PatientProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("Validation Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def patient_detail(request, pk):
    """
    GET: Busca um paciente específico pelo ID
    PUT/PATCH: Atualiza dados do paciente
    """
    patient = get_object_or_404(
        PatientProfile.objects.filter(nutritionist=request.user),
        pk=pk
    )

    if request.method == 'GET':
        serializer = PatientProfileSerializer(patient)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = PatientProfileSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compare_photos_view(request, pk):
    return Response({"message": "Compare Photos API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)