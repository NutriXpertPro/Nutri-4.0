from django.db import models
from django.conf import settings
from users.models import User


class GoogleCalendarIntegration(models.Model):
    """
    Modelo para armazenar informações de integração com o Google Calendar
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='google_calendar_integration',
        verbose_name="Usuário"
    )
    
    # Credenciais OAuth
    access_token = models.TextField(
        verbose_name="Token de Acesso",
        help_text="OAuth 2.0 Access Token"
    )
    refresh_token = models.TextField(
        verbose_name="Token de Atualização",
        help_text="OAuth 2.0 Refresh Token",
        null=True,
        blank=True
    )
    token_expiry = models.DateTimeField(
        verbose_name="Expiração do Token",
        help_text="Data/hora em que o token expira"
    )
    
    # Informações da conta Google
    google_user_id = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="ID do Usuário Google"
    )
    google_email = models.EmailField(
        verbose_name="Email do Google"
    )
    google_display_name = models.CharField(
        max_length=255,
        verbose_name="Nome de Exibição no Google"
    )
    
    # Configurações
    is_active = models.BooleanField(
        default=True,
        verbose_name="Integração Ativa"
    )
    default_calendar_id = models.CharField(
        max_length=255,
        default='primary',
        verbose_name="ID do Calendário Padrão"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Integração Google Calendar"
        verbose_name_plural = "Integrações Google Calendar"
        db_table = 'google_calendar_integration'

    def __str__(self):
        return f"Google Calendar - {self.user.name if self.user.name else self.user.email}"


class GoogleCalendarEvent(models.Model):
    """
    Modelo para mapear eventos sincronizados entre NutriXpertPro e Google Calendar
    """
    # Relacionamento com o evento do NutriXpertPro
    appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        verbose_name="Consulta"
    )
    
    # Informações do evento no Google Calendar
    google_event_id = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="ID do Evento Google"
    )
    google_calendar_id = models.CharField(
        max_length=255,
        verbose_name="ID do Calendário Google"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Evento Google Calendar"
        verbose_name_plural = "Eventos Google Calendar"
        db_table = 'google_calendar_event'

    def __str__(self):
        return f"Evento {self.google_event_id} - Consulta {self.appointment.id}"