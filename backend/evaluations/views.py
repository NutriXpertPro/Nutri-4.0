from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_list(request):
    return Response({"message": "Evaluation List API em construção"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def evaluation_create(request):
    return Response({"message": "Evaluation Create API em construção"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def evaluation_details_partial(request, pk):
    return Response({"message": "Evaluation Partial API deprecated"})