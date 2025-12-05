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

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login_view(request):
    """
    API endpoint para login com Google OAuth.
    Recebe um id_token, verifica com o Google e retorna tokens JWT.
    """
    from .serializers import GoogleLoginSerializer
    from google.oauth2 import id_token
    from google.auth.transport import requests
    from django.conf import settings
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    serializer = GoogleLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    token = serializer.validated_data['id_token']
    
    try:
        # Verificar o token com o Google
        id_info = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH2_CLIENT_ID
        )
        
        # O token é válido. Obter informações do usuário.
        email = id_info['email']
        name = id_info.get('name', '')
        
        # Verificar se o usuário já existe
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Criar novo usuário (assumindo paciente por padrão se não especificado, 
            # mas aqui vamos criar como paciente para segurança)
            user = User.objects.create_user(
                email=email,
                name=name,
                user_type='paciente' # Default para login social
            )
            # Definir uma senha aleatória inutilizável
            user.set_unusable_password()
            user.save()
            
        # Gerar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Login realizado com sucesso",
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
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        # Token inválido
        return Response({"error": "Token Google inválido", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Erro interno no login Google", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
