import os
import time
import logging
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    NutritionistRegistrationSerializer, 
    GoogleLoginSerializer,
    LogoutSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    UserDetailSerializer,
    ChangePasswordSerializer,
    AuthenticationLogSerializer
)
from .models import AuthenticationLog
from .throttles import AuthRateThrottle

logger = logging.getLogger(__name__)

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


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Handle retrieving (GET) and updating (PATCH) the authenticated user's details.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """
        The object to retrieve/update is the user making the request.
        """
        return self.request.user

class ChangePasswordView(generics.GenericAPIView):
    """
    An endpoint for changing password for authenticated users.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been changed successfully."}, status=status.HTTP_200_OK)


def _perform_login(request, required_user_type, unauthorized_error_msg):
    """
    Função auxiliar para lógica de login comum.
    """
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Email e senha são obrigatórios"},
            status=status.HTTP_400_BAD_REQUEST
        )

    logger.info(f"LOGIN ATTEMPT: {email}")
    # O Django vai usar os backends configurados automaticamente
    user = authenticate(request=request, username=email, password=password)

    # Padronizar mensagem para evitar enumeração de contas
    if user is None:
        logger.warning(f"LOGIN FAIL: Authentication failed for {email}")
        time.sleep(0.5)
        return Response(
            {"error": unauthorized_error_msg},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    logger.info(f"LOGIN SUCCESS AUTH: User {user.email} found. Type: {user.user_type}, Required: {required_user_type}")
    
    if user.user_type != required_user_type:
        logger.warning(f"LOGIN FAIL: User type mismatch. Got {user.user_type}, expected {required_user_type}")
        # Adicionando tempo de espera constante para prevenir ataques de timing
        time.sleep(0.5)  # Atraso constante para todos os logins falhos
        return Response(
            {"error": unauthorized_error_msg},
            status=status.HTTP_401_UNAUTHORIZED
        )
    else:

        # Adicionando tempo de espera também para logins bem-sucedidos para manter consistência de tempo
        time.sleep(0.5)  # Atraso constante para todos os requests

    # Registrar log de autenticação bem-sucedida
    from .models import AuthenticationLog
    AuthenticationLog.objects.create(
        user=user,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:255]
    )

    refresh = RefreshToken.for_user(user)
    response = Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

    # Set HttpOnly cookies for Next.js middleware compatibility
    # Use secure=True if running in production (behind HTTPS proxy)
    is_secure = settings.SECURE_SSL_REDIRECT or (not settings.DEBUG)
    response.set_cookie(
        'accessToken',
        str(refresh.access_token),
        httponly=True,
        secure=is_secure,
        samesite='Lax',
        max_age=3600  # 1 hour
    )
    response.set_cookie(
        'refreshToken',
        str(refresh),
        httponly=True,
        secure=is_secure,
        samesite='Lax',
        max_age=7 * 24 * 3600  # 7 days
    )
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def nutricionista_login_view(request):
    """
    API endpoint para login de nutricionista.
    Rate limit: 5 tentativas por minuto (scope: auth).
    """
    return _perform_login(
        request,
        'nutricionista',
        "Credenciais inválidas. Tente novamente."
    )

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def nutricionista_register_view(request):
    """
    API endpoint para registro de nutricionista.
    Rate limit: 5 tentativas por minuto (scope: auth).
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
    return _perform_login(
        request,
        'paciente',
        "Credenciais inválidas. Tente novamente."
    )

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
        logger.info(f"Password reset request for email: {request.data.get('email', 'unknown')}")
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.filter(email=email).first()
            logger.info(f"User found for email {email}: {'Yes' if user else 'No'}")
            if user:
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
                reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
                
                # Enviar email (simulado no console em dev)
                try:
                    send_mail(
                        'Redefinição de Senha - NutriXpertPro',
                        f'Para redefinir sua senha, clique no link: {reset_link}',
                        'noreply@nutrixpert.com.br',
                        [email],
                        fail_silently=False,
                    )
                    logger.info(f"Email sent successfully to {email}")
                except Exception as e:
                    logger.error(f"Error sending email to {email}: {str(e)}")
                    return Response({"error": "Erro ao enviar email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Por segurança, sempre retornar 200 mesmo se o email não existir
            logger.info(f"Password reset response sent for email: {email}")
            return Response({"message": "Se o email existir, as instruções foram enviadas."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, uidb64=None, token=None):
        logger.info(f"--- RESET REQUEST RECEIVED ---")
        
        # Obter uidb64 e token de várias fontes (URL path, query params ou body)
        uidb64 = uidb64 or request.query_params.get('uid') or request.data.get('uid')
        token = token or request.query_params.get('token') or request.data.get('token')

        if not uidb64 or not token:
            logger.warning("Missing UID or Token")
            return Response({"error": "Parâmetros UID e token são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"UID: {uidb64}, Token: {token}")

        serializer = PasswordResetConfirmSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = None
            try:
                # Decodificar o UID do base64
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                logger.info(f"User found by Base64 decode: {user.email}")
            except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
                logger.warning(f"User lookup failed: {e}")
                return Response({"error": "Link inválido - usuário não encontrado."}, status=status.HTTP_400_BAD_REQUEST)

            if user is not None:
                token_valid = default_token_generator.check_token(user, token)
                logger.info(f"Token Valid? {token_valid}")

                if not token_valid:
                     current_token = default_token_generator.make_token(user)
                     logger.debug(f"Expected token (current): {current_token}")
                     logger.debug(f"User State - Password hash: {user.password[:20]}..., Last Login: {user.last_login}")
                     return Response({"error": "Link inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

                if token_valid:
                    user.set_password(serializer.validated_data['password'])
                    user.save()
                    logger.info("Password reset success!")
                    return Response({"message": "Senha redefinida com sucesso."}, status=status.HTTP_200_OK)
            else:
                 return Response({"error": "Link inválido usuário não encontrado."}, status=status.HTTP_400_BAD_REQUEST)

        logger.warning(f"Serializer Errors: {serializer.errors}")
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
    from google.auth.exceptions import GoogleAuthError

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

        # Validar que os campos obrigatórios estão presentes
        email = id_info.get('email')
        if not email:
            return Response({"error": "Token Google inválido: email não encontrado"}, status=status.HTTP_400_BAD_REQUEST)

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

        # Registrar log de autenticação bem-sucedida
        from .models import AuthenticationLog
        AuthenticationLog.objects.create(
            user=user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:255]
        )

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
        # ValueError é levantado quando o token é inválido ou expirado
        print(f"Erro de validação no login Google: {str(e)}")  # Log interno, não exposto ao usuário
        return Response({"error": "Token Google inválido ou expirado"}, status=status.HTTP_400_BAD_REQUEST)

    except GoogleAuthError as e:
        # Erro específico de autenticação Google
        print(f"Erro de autenticação Google: {str(e)}")  # Log interno, não exposto ao usuário
        return Response({"error": "Erro na autenticação com Google"}, status=status.HTTP_400_BAD_REQUEST)

    except KeyError as e:
        # Erro quando campos esperados não estão presentes no token
        print(f"Campo ausente no token Google: {str(e)}")  # Log interno, não exposto ao usuário
        return Response({"error": "Token Google incompleto"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        # Qualquer outro erro inesperado
        # Em produção, você pode querer logar o erro completo em outro lugar
        # e retornar uma mensagem genérica para evitar vazamento de informações
        print(f"Erro interno no login Google: {str(e)}")  # Log interno, não exposto ao usuário
        return Response({"error": "Erro interno no login Google"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AuthenticationLogView(APIView):
    """
    API endpoint para registrar um log de autenticação bem-sucedida.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Apenas permitir criação de logs para o usuário autenticado
        serializer = AuthenticationLogSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Associar automaticamente ao usuário autenticado
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
