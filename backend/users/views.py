from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .serializers import (
    NutritionistRegistrationSerializer, 
    GoogleLoginSerializer,
    LogoutSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)

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

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            try:
                refresh_token = serializer.validated_data["refresh"]
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logout realizado com sucesso."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            if user:
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_link = f"http://localhost:3000/auth/reset-password/{uid}/{token}/"  # Frontend URL
                
                # Enviar email (simulado no console em dev)
                try:
                    send_mail(
                        'Redefinição de Senha - NutriXpertPro',
                        f'Para redefinir sua senha, clique no link: {reset_link}',
                        'noreply@nutrixpert.com.br',
                        [email],
                        fail_silently=False,
                    )
                except Exception as e:
                    return Response({"error": "Erro ao enviar email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Por segurança, sempre retornar 200 mesmo se o email não existir
            return Response({"message": "Se o email existir, as instruções foram enviadas."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(serializer.validated_data['password'])
                user.save()
                return Response({"message": "Senha redefinida com sucesso."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Link inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login_view(request):
    """
    API endpoint para login com Google OAuth.
    Recebe um id_token, verifica com o Google e retorna tokens JWT.
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests
    
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
        
        email = id_info['email']
        name = id_info.get('name', '')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email,
                name=name,
                user_type='paciente'
            )
            user.set_unusable_password()
            user.save()
            
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
        return Response({"error": "Token Google inválido", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Erro interno no login Google", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
