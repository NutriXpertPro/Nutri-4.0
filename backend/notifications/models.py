from django.db import models
from django.conf import settings
from utils.sanitization import sanitize_string


class Notification(models.Model):
    """
    Representa uma notificação individual enviada a um usuário.
    """
    NOTIFICATION_TYPES = [
        ('appointment_reminder', 'Lembrete de Consulta'),
        ('diet_expiry', 'Dieta Próxima ao Vencimento'),
        ('new_diet', 'Novo Plano Alimentar'),
        ('meal_checkin', 'Registro de Refeição'),
        ('new_message', 'Nova Mensagem'),
        ('system', 'Notificação do Sistema'),
        ('payment', 'Notificação de Pagamento'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.title:
            self.title = sanitize_string(self.title)
        if self.message:
            self.message = sanitize_string(self.message)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} - {self.user}'


class NotificationSettings(models.Model):
    """
    Armazena as preferências de notificação de um usuário.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_settings'
    )
    
    # Preferências de notificação por tipo
    notify_appointment_reminder = models.BooleanField(
        default=True,
        verbose_name='Notificar sobre lembretes de consulta'
    )
    notify_diet_expiry = models.BooleanField(
        default=True,
        verbose_name='Notificar sobre dietas próximas ao vencimento'
    )
    notify_new_message = models.BooleanField(
        default=True,
        verbose_name='Notificar sobre novas mensagens'
    )
    notify_system = models.BooleanField(
        default=True,
        verbose_name='Notificar sobre notícias do sistema'
    )
    notify_payment = models.BooleanField(
        default=True,
        verbose_name='Notificar sobre pagamentos'
    )
    
    # Preferências de método de notificação
    email_notifications = models.BooleanField(
        default=True,
        verbose_name='Receber notificações por e-mail'
    )
    push_notifications = models.BooleanField(
        default=True,
        verbose_name='Receber notificações push'
    )
    in_app_notifications = models.BooleanField(
        default=True,
        verbose_name='Receber notificações dentro do app'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuração de Notificação'
        verbose_name_plural = 'Configurações de Notificação'

    def __str__(self):
        return f'Configurações de {self.user}'