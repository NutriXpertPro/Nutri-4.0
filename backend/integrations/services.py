"""
Servidor para tarefas de integração com o Google Calendar
"""
from datetime import datetime, timedelta
from django.conf import settings
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from appointments.models import Appointment
from .models import GoogleCalendarIntegration, GoogleCalendarEvent
import requests


def get_google_calendar_service(user):
    """
    Retorna uma instância do serviço do Google Calendar
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
    
    return build('calendar', 'v3', credentials=credentials)


def sync_appointment_to_google_calendar(appointment, calendar_id='primary'):
    """
    Sincroniza uma consulta específica com o Google Calendar
    """
    service = get_google_calendar_service(appointment.nutritionist)
    if not service:
        return None

    # Preparar dados do evento
    event_data = {
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
            return calendar_event.google_event_id
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
            return google_event_id
    except Exception as e:
        print(f'Erro ao sincronizar evento com Google Calendar: {str(e)}')
        return None