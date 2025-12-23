import os
import json
import requests
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from .models import GoogleCalendarIntegration, GoogleCalendarEvent
from .serializers import GoogleCalendarIntegrationSerializer
from appointments.models import Appointment

logger = logging.getLogger(__name__)

# Permitir transporte inseguro em ambiente de desenvolvimento (OAuth2 sobre HTTP)
if settings.DEBUG:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'


class GoogleCalendarAuthView(APIView):
    """
    Views para autenticação com o Google Calendar
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Inicia o processo de autenticação OAuth com Google
        """
        print(">>> [LOG] Iniciando fluxo Google Auth (V5) <<<")
        
        # Armazenar o ID do usuário na sessão para uso no callback
        request.session['oauth_user_id'] = request.user.id

        # Configuração do OAuth
        client_config = {
            "web": {
                "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{settings.BACKEND_URL}/api/v1/integrations/google-calendar/callback/"],
            }
        }

        flow = Flow.from_client_config(
            client_config,
            scopes=[
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/calendar.events",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ],
            redirect_uri=f"{settings.BACKEND_URL}/api/v1/integrations/google-calendar/callback/"
        )

        # Gerar authorization URL - prompt='consent' força reautorização para garantir novos escopos
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )

        # Armazenar o state na sessão
        request.session['oauth_state'] = state

        return Response({
            'authorization_url': authorization_url,
            'state': state
        }, status=status.HTTP_200_OK)


class GoogleCalendarCallbackView(APIView):
    """
    View para lidar com o callback do OAuth
    """
    permission_classes = []

    def get(self, request):
        """
        Processa o callback do OAuth e salva as credenciais
        """
        print(">>> [LOG] Recebendo callback do Google (V5) <<<")
        
        # Verificar o state para segurança
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            return Response(
                {'error': 'Invalid state parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user_id = request.session.get('oauth_user_id')
        if not user_id:
            return Response(
                {'error': 'Sessão de usuário ausente'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            from users.models import User
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuário não encontrado'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        client_config = {
            "web": {
                "client_id": settings.GOOGLE_OAUTH2_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{settings.BACKEND_URL}/api/v1/integrations/google-calendar/callback/"],
            }
        }

        flow = Flow.from_client_config(
            client_config,
            scopes=[
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/calendar.events",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ],
            redirect_uri=f"{settings.BACKEND_URL}/api/v1/integrations/google-calendar/callback/"
        )

        auth_url = request.build_absolute_uri()
        if settings.DEBUG and settings.BACKEND_URL not in auth_url:
            if "localhost" in settings.BACKEND_URL and "127.0.0.1" in auth_url:
                auth_url = auth_url.replace("127.0.0.1", "localhost")
            elif "127.0.0.1" in settings.BACKEND_URL and "localhost" in auth_url:
                auth_url = auth_url.replace("localhost", "127.0.0.1")

        flow.fetch_token(authorization_response=auth_url)
        credentials = flow.credentials

        # Obter informações do usuário do Google
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {credentials.token}'}
        )
        user_info = user_info_response.json()
        print(f">>> [LOG] Google User Info: {user_info}")

        # google_user_id pode vir como 'id' ou 'sub'
        google_id = user_info.get('id') or user_info.get('sub')
        
        if not google_id:
            return Response(
                {'error': 'Não foi possível obter o ID do usuário do Google. Verifique os escopos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Salvar ou atualizar a integração
        integration, created = GoogleCalendarIntegration.objects.update_or_create(
            user=user,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': datetime.fromtimestamp(credentials.expiry.timestamp()) if credentials.expiry else datetime.now() + timedelta(hours=1),
                'google_user_id': google_id,
                'google_email': user_info.get('email'),
                'google_display_name': user_info.get('name', user_info.get('email', 'Google User')),
                'is_active': True
            }
        )

        print(f">>> [LOG] Integração para {user.email} {'criada' if created else 'atualizada'} <<<")

        frontend_url = f"{settings.FRONTEND_URL}/settings#google-calendar"
        return redirect(f"{frontend_url}?oauth_success=true")


class GoogleCalendarSyncViewSet(viewsets.ViewSet):
    """
    ViewSet para operações de sincronização com Google Calendar
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Retorna os dados da integração do usuário logado
        """
        try:
            integration = GoogleCalendarIntegration.objects.get(user=request.user)
            serializer = GoogleCalendarIntegrationSerializer(integration)
            return Response(serializer.data)
        except GoogleCalendarIntegration.DoesNotExist:
            return Response({'error': 'Integração não encontrada'}, status=status.HTTP_404_NOT_FOUND)

    def _get_credentials(self, user):
        try:
            integration = GoogleCalendarIntegration.objects.get(user=user)
        except GoogleCalendarIntegration.DoesNotExist:
            return None

        if datetime.now() > integration.token_expiry:
            data = {
                'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
                'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                'refresh_token': integration.refresh_token,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post('https://oauth2.googleapis.com/token', data=data)
            if response.status_code == 200:
                tokens = response.json()
                integration.access_token = tokens['access_token']
                integration.token_expiry = datetime.now() + timedelta(seconds=tokens.get('expires_in', 3600))
                integration.save()
        
        return Credentials(
            token=integration.access_token,
            refresh_token=integration.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
            client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        )

    @action(detail=False, methods=['post'])
    def sync_appointment(self, request):
        appointment_id = request.data.get('appointment_id')
        calendar_id = request.data.get('calendar_id', 'primary')

        try:
            appointment = Appointment.objects.get(id=appointment_id, nutritionist=request.user)
        except Appointment.DoesNotExist:
            return Response({'error': 'Consulta não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        credentials = self._get_credentials(request.user)
        if not credentials:
            return Response({'error': 'Integração não configurada'}, status=status.HTTP_400_BAD_REQUEST)

        service = build('calendar', 'v3', credentials=credentials)
        event_data = self._create_event_data(appointment)

        try:
            try:
                calendar_event = GoogleCalendarEvent.objects.get(appointment=appointment)
                service.events().update(
                    calendarId=calendar_id,
                    eventId=calendar_event.google_event_id,
                    body=event_data
                ).execute()
                google_event_id = calendar_event.google_event_id
            except GoogleCalendarEvent.DoesNotExist:
                created_event = service.events().insert(calendarId=calendar_id, body=event_data).execute()
                google_event_id = created_event.get('id')
                GoogleCalendarEvent.objects.create(
                    appointment=appointment,
                    google_event_id=google_event_id,
                    google_calendar_id=calendar_id
                )

            return Response({'message': 'Consulta sincronizada', 'event_id': google_event_id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _create_event_data(self, appointment):
        return {
            'summary': f'Consulta com {appointment.patient.user.name}',
            'description': f'Nutri 4.0 - Consulta {appointment.type}',
            'start': {
                'dateTime': appointment.date.strftime('%Y-%m-%dT%H:%M:%S'),
                'timeZone': 'America/Sao_Paulo',
            },
            'end': {
                'dateTime': (appointment.date + timedelta(minutes=appointment.duration)).strftime('%Y-%m-%dT%H:%M:%S'),
                'timeZone': 'America/Sao_Paulo',
            },
            'attendees': [{'email': appointment.patient.user.email}],
        }

    @action(detail=False, methods=['get'])
    def get_calendars(self, request):
        credentials = self._get_credentials(request.user)
        if not credentials:
            return Response({'error': 'Não configurada'}, status=status.HTTP_400_BAD_REQUEST)

        service = build('calendar', 'v3', credentials=credentials)
        try:
            calendar_list = service.calendarList().list().execute()
            calendars = calendar_list.get('items', [])
            return Response({'calendars': calendars})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'])
    def disconnect(self, request):
        try:
            integration = GoogleCalendarIntegration.objects.get(user=request.user)
            integration.delete()
            return Response({'message': 'Desconectada'})
        except GoogleCalendarIntegration.DoesNotExist:
            return Response({'message': 'Não encontrada'}, status=status.HTTP_404_NOT_FOUND)
