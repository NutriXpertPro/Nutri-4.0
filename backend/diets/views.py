from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diet_list(request):
    return Response({"message": "Diet List API em construção"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def diet_create(request):
    return Response({"message": "Diet Create API em construção"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diet_detail(request, pk):
    return Response({"message": "Diet Detail API em construção"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diet_details_partial(request, pk):
    return Response({"message": "Diet Partial API deprecated"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def plano_alimentar_view(request):
    return Response({"message": "Plano Alimentar API em construção"})
