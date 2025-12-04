from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def anamnesis_list(request):
    return Response({"message": "Anamnesis List API em construção"})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def anamnesis_form(request, pk=None):
    return Response({"message": "Anamnesis Form API em construção"})
