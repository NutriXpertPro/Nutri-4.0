from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import PatientProfile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def patient_create(request):
    return Response({"message": "Create Patient API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def patient_edit(request, pk):
    return Response({"message": "Edit Patient API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_list(request):
    return Response({"message": "List Patients API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_detail(request, pk):
    return Response({"message": "Patient Detail API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def compare_photos_view(request, pk):
    return Response({"message": "Compare Photos API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)