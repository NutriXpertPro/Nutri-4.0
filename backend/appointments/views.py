from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    return Response({"message": "Appointment List API em construção"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def appointment_create(request):
    return Response({"message": "Appointment Create API em construção"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, pk):
    return Response({"message": "Appointment Detail API em construção"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_view(request):
    return Response({"message": "Calendar API em construção"})
