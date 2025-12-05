from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """
    API endpoint para dados do dashboard.
    Substitui a antiga view baseada em template.
    """
    return Response({
        "message": "Dashboard API em construção",
        "user": request.user.email
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def nutricionista_login_view(request):
    """
    API endpoint para login de nutricionista.
    """
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(email=email, password=password)
    
    if user and user.user_type == 'nutricionista':
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def nutricionista_register_view(request):
    """
    API endpoint para registro de nutricionista.
    """
    from .serializers import NutritionistRegistrationSerializer
    
    serializer = NutritionistRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Nutricionista registrado com sucesso",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "user_type": user.user_type
            },
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def paciente_login_view(request):
    """
    API endpoint para login de paciente.
    """
    return Response({"message": "Login paciente via API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['POST'])
@permission_classes([AllowAny])
def paciente_register_view(request):
    """
    API endpoint para registro de paciente.
    """
    return Response({"message": "Registro paciente via API em construção"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resources_view(request):
    return Response({"message": "Resources API"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def settings_view(request):
    return Response({"message": "Settings API"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_dashboard_view(request):
    return Response({"message": "Patient Dashboard API"})

@api_view(['POST'])
def logout_view(request):
    return Response({"message": "Logout realizado (client-side deve descartar token)"})
