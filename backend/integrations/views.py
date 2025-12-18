import os
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
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
from django.shortcuts import redirect
from urllib.parse import urlencode
import json
import requests


class GoogleCalendarAuthView(APIView):
    """
    Views para autenticação com o Google Calendar
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Inicia o processo de autenticação OAuth com Google
        """
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
                "https://www.googleapis.com/auth/calendar.events"
            ],
            redirect_uri=f"{settings.BACKEND_URL}/api/v1/integrations/google-calendar/callback/"
        )

        # Gerar authorization URL
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Processa o callback do OAuth e salva as credenciais
        """
        # Verificar o state para segurança
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            return Response(
                {'error': 'Invalid state parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
                "https://www.googleapis.com/auth/calendar.events"
            ],
            redirect_uri=f"{settings.BACKEND_URL}/api/v1/integrations/google-calendar/callback/"
        )
        flow.fetch_token(authorization_response=request.build_absolute_uri())

        credentials = flow.credentials

        # Obter informações do usuário do Google
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {credentials.token}'}
        )
        user_info = user_info_response.json()

        # Salvar ou atualizar a integração
        integration, created = GoogleCalendarIntegration.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_expiry': datetime.fromtimestamp(credentials.expiry.timestamp()),
                'google_user_id': user_info.get('id'),
                'google_email': user_info.get('email'),
                'google_display_name': user_info.get('name', user_info.get('email')),
                'is_active': True
            }
        )

        # Redirecionar para a interface do frontend com sucesso
        frontend_url = f"{settings.FRONTEND_URL}/settings#google-calendar"
        return redirect(f"{frontend_url}?oauth_success=true")


class GoogleCalendarSyncViewSet(viewsets.ViewSet):
    """
    ViewSet para operações de sincronização com Google Calendar
    """
    permission_classes = [IsAuthenticated]

    def _get_credentials(self, user):
        """
        Obtém as credenciais atualizadas do Google Calendar
        """
        try:
            integration = GoogleCalendarIntegration.objects.get(user=user)
        except GoogleCalendarIntegration.DoesNotExist:
            return None

        # Verificar se o token expirou e atualizar se necessário
        if datetime.now() > integration.token_expiry:
            # Fazer refresh do token
            data = {
                'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
                'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                'refresh_token': integration.refresh_token,
                'grant_type': 'refresh_token'
            }
            
            response = requests.post('https://oauth2.googleapis.com/token', data=data)
            if response.status_code == 200:
                tokens = response.json()
                
                # Atualizar o banco de dados
                integration.access_token = tokens['access_token']
                integration.token_expiry = datetime.now() + timedelta(seconds=tokens.get('expires_in', 3600))
                integration.save()
        
        # Criar objeto de credenciais
        credentials = Credentials(
            token=integration.access_token,
            refresh_token=integration.refresh_token,
            token_uri='https://oauth2.googleapis.com/token',
            client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
            client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        )
        
        return credentials

    @action(detail=False, methods=['post'])
    def sync_appointment(self, request):
        """
        Sincroniza uma consulta específica com o Google Calendar
        """
        appointment_id = request.data.get('appointment_id')
        calendar_id = request.data.get('calendar_id', 'primary')

        try:
            appointment = Appointment.objects.get(id=appointment_id, nutritionist=request.user)
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Consulta não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obter credenciais
        credentials = self._get_credentials(request.user)
        if not credentials:
            return Response(
                {'error': 'Integração com Google Calendar não configurada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Criar serviço do Google Calendar
        service = build('calendar', 'v3', credentials=credentials)

        # Preparar dados do evento
        event_data = {
            'summary': f'Consulta com {appointment.patient.user.name}',
            'location': 'Online' if appointment.type == 'online' else appointment.nutritionist.address if appointment.nutritionist.address else '',
            'description': f'Consulta com {appointment.patient.user.name}\n\nObservações: {appointment.notes or ""}',
            'start': {
                'dateTime': appointment.date.strftime('%Y-%m-%dT%H:%M:%S'),
                'timeZone': 'America/Sao_Paulo',  # Ajustar para o timezone configurado
            },
            'end': {
                'dateTime': (appointment.date + timedelta(minutes=appointment.duration)).strftime('%Y-%m-%dT%H:%M:%S'),
                'timeZone': 'America/Sao_Paulo',  # Ajustar para o timezone configurado
            },
            'attendees': [
                {'email': appointment.patient.user.email},
                {'email': request.user.email}
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 24 horas antes
                    {'method': 'popup', 'minutes': 10},        # 10 minutos antes
                ],
            },
        }

        try:
            # Verificar se já existe um evento sincronizado
            try:
                calendar_event = GoogleCalendarEvent.objects.get(appointment=appointment)
                # Atualizar evento existente
                updated_event = service.events().update(
                    calendarId=calendar_id,
                    eventId=calendar_event.google_event_id,
                    body=event_data
                ).execute()
            except GoogleCalendarEvent.DoesNotExist:
                # Criar novo evento
                created_event = service.events().insert(
                    calendarId=calendar_id,
                    body=event_data
                ).execute()
                google_event_id = created_event.get('id')
                
                # Salvar o mapeamento no banco
                GoogleCalendarEvent.objects.create(
                    appointment=appointment,
                    google_event_id=google_event_id,
                    google_calendar_id=calendar_id
                )

            return Response({
                'message': 'Consulta sincronizada com sucesso',
                'event_id': google_event_id if 'google_event_id' in locals() else calendar_event.google_event_id
            })
        except Exception as e:
            return Response(
                {'error': f'Erro ao sincronizar evento: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def sync_all_appointments(self, request):
        """
        Sincroniza todas as consultas do nutricionista com o Google Calendar
        """
        # Obter credenciais
        credentials = self._get_credentials(request.user)
        if not credentials:
            return Response(
                {'error': 'Integração com Google Calendar não configurada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Criar serviço do Google Calendar
        service = build('calendar', 'v3', credentials=credentials)

        # Obter consultas do nutricionista nos próximos 30 dias
        start_date = datetime.now()
        end_date = start_date + timedelta(days=30)
        
        appointments = Appointment.objects.filter(
            nutritionist=request.user,
            date__gte=start_date,
            date__lte=end_date
        )

        results = []
        for appointment in appointments:
            # Verificar se já está sincronizado
            try:
                calendar_event = GoogleCalendarEvent.objects.get(appointment=appointment)
                # Atualizar evento existente
                event_data = self._create_event_data(appointment)
                updated_event = service.events().update(
                    calendarId=calendar_event.google_calendar_id,
                    eventId=calendar_event.google_event_id,
                    body=event_data
                ).execute()
                
                results.append({
                    'appointment_id': appointment.id,
                    'status': 'updated',
                    'event_id': calendar_event.google_event_id
                })
            except GoogleCalendarEvent.DoesNotExist:
                # Criar novo evento
                event_data = self._create_event_data(appointment)
                created_event = service.events().insert(
                    calendarId='primary',
                    body=event_data
                ).execute()
                
                GoogleCalendarEvent.objects.create(
                    appointment=appointment,
                    google_event_id=created_event.get('id'),
                    google_calendar_id='primary'
                )
                
                results.append({
                    'appointment_id': appointment.id,
                    'status': 'created',
                    'event_id': created_event.get('id')
                })
            except Exception as e:
                results.append({
                    'appointment_id': appointment.id,
                    'status': 'error',
                    'error': str(e)
                })

        return Response({
            'message': 'Sincronização concluída',
            'results': results
        })

    def _create_event_data(self, appointment):
        """
        Cria o dicionário de dados para o evento do Google Calendar
        """
        return {
            'summary': f'Consulta com {appointment.patient.user.name}',
            'location': 'Online' if appointment.type == 'online' else appointment.nutritionist.address if appointment.nutritionist.address else '',
            'description': f'Consulta com {appointment.patient.user.name}\n\nObservações: {appointment.notes or ""}',
            'start': {
                'dateTime': appointment.date.strftime('%Y-%m-%dT%H:%M:%S'),
                'timeZone': 'America/Sao_Paulo',
            },
            'end': {
                'dateTime': (appointment.date + timedelta(minutes=appointment.duration)).strftime('%Y-%m-%dT%H:%M:%S'),
                'timeZone': 'America/Sao_Paulo',
            },
            'attendees': [
                {'email': appointment.patient.user.email},
                {'email': appointment.nutritionist.email}
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
        }

    @action(detail=False, methods=['get'])
    def get_calendars(self, request):
        """
        Retorna a lista de calendários disponíveis na conta do Google
        """
        # Obter credenciais
        credentials = self._get_credentials(request.user)
        if not credentials:
            return Response(
                {'error': 'Integração com Google Calendar não configurada'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Criar serviço do Google Calendar
        service = build('calendar', 'v3', credentials=credentials)

        try:
            # Listar calendários
            calendar_list = service.calendarList().list().execute()
            calendars = calendar_list.get('items', [])

            # Formatar resposta
            formatted_calendars = []
            for calendar in calendars:
                formatted_calendars.append({
                    'id': calendar['id'],
                    'summary': calendar['summary'],
                    'primary': calendar.get('primary', False),
                    'access_role': calendar.get('accessRole', 'reader')
                })

            return Response({
                'calendars': formatted_calendars
            })
        except Exception as e:
            return Response(
                {'error': f'Erro ao obter calendários: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def disconnect(self, request):
        """
        Desconecta a integração com o Google Calendar
        """
        try:
            integration = GoogleCalendarIntegration.objects.get(user=request.user)
            integration.delete()
            
            return Response({
                'message': 'Integração com Google Calendar desconectada'
            })
        except GoogleCalendarIntegration.DoesNotExist:
            return Response(
                {'message': 'Nenhuma integração encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )