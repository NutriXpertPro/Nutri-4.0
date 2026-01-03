from django.db import models
from django.conf import settings
from users.models import User


class AutomationTemplate(models.Model):
    """
    Modelo para templates de automação de mensagens.
    """
    TRIGGER_CHOICES = [
        ('appointment_confirmation', 'Confirmação de Agendamento'),
        ('appointment_reminder', 'Lembrete 24h'),
        ('birthday', 'Aniversário'),
        ('follow_up', 'Follow-up pós-consulta'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nome do Template")
    trigger = models.CharField(max_length=50, choices=TRIGGER_CHOICES, verbose_name="Gatilho")
    content = models.TextField(verbose_name="Conteúdo da Mensagem")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    delay_hours = models.IntegerField(default=0, verbose_name="Atraso em Horas", blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Criado por",
        related_name="automation_templates"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Template de Automação"
        verbose_name_plural = "Templates de Automação"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_trigger_display()}"

    def get_replacement_context(self, **kwargs):
        """
        Retorna um dicionário com variáveis para substituição no conteúdo da mensagem
        """
        context = {
            'patient_name': kwargs.get('patient_name', '{patient_name}'),
            'nutritionist_name': kwargs.get('nutritionist_name', '{nutritionist_name}'),
            'appointment_date': kwargs.get('appointment_date', '{appointment_date}'),
            'appointment_time': kwargs.get('appointment_time', '{appointment_time}'),
        }
        return context

    def render_content(self, **kwargs):
        """
        Renderiza o conteúdo substituindo variáveis por valores reais
        """
        content = self.content
        context = self.get_replacement_context(**kwargs)

        for key, value in context.items():
            content = content.replace(f'{{{key}}}', str(value))

        return content