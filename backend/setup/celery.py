import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Configurar o módulo de configuração padrão do Django para o Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

app = Celery('nutri40')

# Configurações do Celery a partir das configurações do Django com namespace 'CELERY'
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobrir automaticamente tarefas nos apps do Django
app.autodiscover_tasks()

# Configuração do Celery Beat para tarefas agendadas
app.conf.beat_schedule = {
    # Tarefa para verificar lembretes de consulta a cada hora
    'send-appointment-reminder-notifications': {
        'task': 'automation.tasks.send_appointment_reminder_notifications',
        'schedule': 3600.0,  # Executar a cada hora (3600 segundos)
    },
    # Tarefa para verificar dietas expirando a cada dia
    'send-diet-expiry-notifications': {
        'task': 'automation.tasks.send_diet_expiry_notifications',
        'schedule': crontab(hour=9, minute=0),  # Executar diariamente às 9h
    },
    # Tarefa para verificar mensagens urgentes a cada 6 horas
    'check-urgent-messages': {
        'task': 'automation.tasks.check_urgent_messages',
        'schedule': crontab(minute=0, hour='*/6'),  # Executar a cada 6 horas
    },
    # Tarefa para verificar consultas para amanhã a cada dia
    'check-appointment-reminders': {
        'task': 'automation.tasks.check_appointment_reminders',
        'schedule': crontab(hour=8, minute=0),  # Executar diariamente às 8h
    },
    # Tarefa para verificar aniversários a cada dia
    'check-birthday-automation': {
        'task': 'automation.tasks.check_birthday_automation',
        'schedule': crontab(hour=9, minute=0),  # Executar diariamente às 9h
    },
    # Tarefa para verificar follow-up pós-consulta a cada dia
    'check-follow-up-automation': {
        'task': 'automation.tasks.check_follow_up_automation',
        'schedule': crontab(hour=10, minute=0),  # Executar diariamente às 10h
    },
}

app.conf.timezone = 'America/Sao_Paulo'