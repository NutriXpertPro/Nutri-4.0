from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import AutomationTemplate
from messages.models import Conversation, Message
from appointments.models import Appointment
from users.models import User
from notifications.models import Notification
from notifications.utils import should_send_notification
from django.db.models import Q


@shared_task
def check_appointment_reminders():
    """
    Tarefa que verifica consultas nas próximas 24 horas e envia lembretes
    """
    from appointments.models import Appointment
    
    # Obter consultas para amanhã
    tomorrow = timezone.now().date() + timedelta(days=1)
    appointments_tomorrow = Appointment.objects.filter(
        date=tomorrow,
        status='confirmed'  # Apenas consultas confirmadas
    )
    
    # Obter template de lembrete
    reminder_template = AutomationTemplate.objects.filter(
        trigger='appointment_reminder',
        is_active=True
    ).first()
    
    if not reminder_template:
        return
    
    for appointment in appointments_tomorrow:
        # Substituir variáveis no conteúdo
        content = reminder_template.content.replace(
            '{patient_name}', appointment.patient.user.name
        ).replace(
            '{nutritionist_name}', appointment.nutritionist.name
        ).replace(
            '{appointment_time}', appointment.time.strftime('%H:%M')
        ).replace(
            '{appointment_date}', appointment.date.strftime('%d/%m/%Y')
        )
        
        # Criar conversa se não existir
        conversation, created = Conversation.objects.get_or_create(
            # Criar conversa entre nutricionista e paciente
            participants__in=[appointment.nutritionist, appointment.patient.user],
            defaults={
                'participants': [appointment.nutritionist, appointment.patient.user]
            }
        )
        
        # Adicionar participantes se for nova conversa
        if created:
            conversation.participants.add(appointment.nutritionist, appointment.patient.user)
        
        # Enviar mensagem
        Message.objects.create(
            conversation=conversation,
            sender=appointment.nutritionist,
            content=content
        )


@shared_task
def check_birthday_automation():
    """
    Tarefa que verifica aniversários e envia mensagens
    """
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    today = timezone.now().date()
    
    # Obter pacientes que fazem aniversário hoje
    birthday_patients = User.objects.filter(
        date_joined__month=today.month,
        date_joined__day=today.day,
        is_nutritionist=False
    )
    
    # Obter template de aniversário
    birthday_template = AutomationTemplate.objects.filter(
        trigger='birthday',
        is_active=True
    ).first()
    
    if not birthday_template:
        return
    
    for patient in birthday_patients:
        # Substituir variáveis no conteúdo
        content = birthday_template.content.replace(
            '{patient_name}', patient.name
        )
        
        # Criar conversa entre nutricionista e paciente
        # Assumindo que o nutricionista padrão envia a mensagem
        # Na prática, isso seria associado ao nutricionista responsável pelo paciente
        
        # Enviar mensagem
        # (Implementação simplificada)
        pass


@shared_task
def send_appointment_confirmation(conversation_id, appointment_id):
    """
    Tarefa para envio de confirmação de agendamento
    """
    try:
        from appointments.models import Appointment
        
        appointment = Appointment.objects.get(id=appointment_id)
        conversation = Conversation.objects.get(id=conversation_id)
        
        # Obter template de confirmação
        confirmation_template = AutomationTemplate.objects.filter(
            trigger='appointment_confirmation',
            is_active=True
        ).first()
        
        if not confirmation_template:
            return
        
        # Substituir variáveis no conteúdo
        content = confirmation_template.content.replace(
            '{patient_name}', appointment.patient.user.name
        ).replace(
            '{nutritionist_name}', appointment.nutritionist.name
        ).replace(
            '{appointment_time}', appointment.time.strftime('%H:%M')
        ).replace(
            '{appointment_date}', appointment.date.strftime('%d/%m/%Y')
        )
        
        # Enviar mensagem
        Message.objects.create(
            conversation=conversation,
            sender=appointment.nutritionist,
            content=content
        )
    except (Appointment.DoesNotExist, Conversation.DoesNotExist):
        pass


@shared_task
def check_follow_up_automation():
    """
    Tarefa para envio de follow-up pós-consulta
    """
    from appointments.models import Appointment

    # Obter consultas que ocorreram há 1-2 dias
    two_days_ago = timezone.now() - timedelta(days=2)
    one_day_ago = timezone.now() - timedelta(days=1)

    past_appointments = Appointment.objects.filter(
        date__gte=two_days_ago.date(),
        date__lte=one_day_ago.date(),
        status='completed'  # Apenas consultas completadas
    )

    # Obter template de follow-up
    follow_up_template = AutomationTemplate.objects.filter(
        trigger='follow_up',
        is_active=True
    ).first()

    if not follow_up_template:
        return

    for appointment in past_appointments:
        # Substituir variáveis no conteúdo
        content = follow_up_template.content.replace(
            '{patient_name}', appointment.patient.user.name
        ).replace(
            '{nutritionist_name}', appointment.nutritionist.name
        )

        # Criar ou obter conversa
        conversation, created = Conversation.objects.get_or_create(
            participants__in=[appointment.nutritionist, appointment.patient.user],
            defaults={
                'participants': [appointment.nutritionist, appointment.patient.user]
            }
        )

        if created:
            conversation.participants.add(appointment.nutritionist, appointment.patient.user)

        # Enviar mensagem
        Message.objects.create(
            conversation=conversation,
            sender=appointment.nutritionist,
            content=content
        )


@shared_task
def send_appointment_reminder_notifications():
    """
    Tarefa que verifica consultas nas próximas 1 hora e envia notificações
    """
    from appointments.models import Appointment

    # Obter o horário atual e daqui a 1 hora
    now = timezone.now()
    one_hour_later = now + timedelta(hours=1)

    # Obter consultas nos próximos 60 minutos
    appointments_in_hour = Appointment.objects.filter(
        date=now.date(),  # Apenas consultas de hoje
        time__gte=now.time(),
        time__lt=one_hour_later.time(),
        status='confirmed'  # Apenas consultas confirmadas
    )

    for appointment in appointments_in_hour:
        # Verificar se o paciente deve receber notificação de lembrete de consulta
        if should_send_notification(appointment.patient.user, 'appointment_reminder'):
            # Criar notificação para o paciente
            Notification.objects.create(
                user=appointment.patient.user,
                title="Lembrete de Consulta",
                message=f"Sua consulta está marcada para {appointment.time.strftime('%H:%M')} hoje. [ID:{appointment.id}]",
                notification_type='appointment_reminder'
            )

        # Verificar se o nutricionista deve receber notificação de lembrete de consulta
        if should_send_notification(appointment.nutritionist, 'appointment_reminder'):
            # Criar notificação para o nutricionista
            Notification.objects.create(
                user=appointment.nutritionist,
                title="Lembrete de Consulta",
                message=f"Sua consulta com {appointment.patient.user.name} está marcada para {appointment.time.strftime('%H:%M')} hoje. [ID:{appointment.id}] [PID:{appointment.patient.id}]",
                notification_type='appointment_reminder'
            )


@shared_task
def send_diet_expiry_notifications():
    """
    Tarefa que verifica dietas que expiram em 7 dias e envia notificações
    """
    from diets.models import Diet
    from users.models import User

    # Obter a data de hoje e daqui a 7 dias
    today = timezone.now().date()
    seven_days_later = today + timedelta(days=7)

    # Obter dietas que expiram em 7 dias
    diets_expiring = Diet.objects.filter(
        expiry_date=seven_days_later,  # Dietas que expiram daqui a 7 dias
        is_active=True  # Apenas dietas ativas
    )

    for diet in diets_expiring:
        # Verificar se o paciente deve receber notificação de expiração de dieta
        if should_send_notification(diet.patient.user, 'diet_expiry'):
            # Criar notificação para o paciente
            Notification.objects.create(
                user=diet.patient.user,
                title="Dieta Próxima ao Vencimento",
                message=f"Sua dieta '{diet.title}' está programada para expirar em 7 dias. [ID:{diet.id}]",
                notification_type='diet_expiry'
            )

        # Verificar se o nutricionista deve receber notificação de expiração de dieta
        if should_send_notification(diet.nutritionist, 'diet_expiry'):
            # Criar notificação para o nutricionista
            Notification.objects.create(
                user=diet.nutritionist,
                title="Dieta Próxima ao Vencimento",
                message=f"A dieta de {diet.patient.user.name} ('{diet.title}') está programada para expirar em 7 dias. [ID:{diet.id}] [PID:{diet.patient.id}]",
                notification_type='diet_expiry'
            )


@shared_task
def send_new_message_notifications(message_id):
    """
    Tarefa que envia notificações para novas mensagens
    """
    from messages.models import Message, Conversation

    try:
        # Obter a mensagem pelo ID
        message = Message.objects.get(id=message_id)

        # Obter a conversa e seus participantes
        conversation = message.conversation
        participants = conversation.participants.all()

        # Enviar notificação para todos os participantes exceto o remetente
        for participant in participants:
            if participant != message.sender:
                # Verificar se o participante deve receber notificação de nova mensagem
                if should_send_notification(participant, 'new_message'):
                    # Tentar obter o ID do perfil do paciente se o remetente for um paciente
                    patient_pid = ""
                    if message.sender.user_type == 'paciente' and hasattr(message.sender, 'patient_profile'):
                        patient_pid = f" [PID:{message.sender.patient_profile.id}]"

                    # Criar notificação para o participante
                    Notification.objects.create(
                        user=participant,
                        title="Nova Mensagem",
                        message=f"{message.sender.name} enviou uma nova mensagem: {message.content[:50]}... [ID:{conversation.id}]{patient_pid}",
                        notification_type='new_message'
                    )
    except Message.DoesNotExist:
        # A mensagem não existe mais
        pass


@shared_task
def check_urgent_messages():
    """
    Tarefa que verifica mensagens não respondidas há mais de 24h e cria notificações urgentes
    """
    from messages.models import Message, Conversation
    from django.utils import timezone
    from datetime import timedelta

    # Obter o horário de 24h atrás
    time_24h_ago = timezone.now() - timedelta(hours=24)

    # Encontrar mensagens não lidas mais antigas que 24h
    urgent_messages = Message.objects.filter(
        timestamp__lt=time_24h_ago,
        is_read=False
    ).select_related('conversation', 'sender')

    for message in urgent_messages:
        # Verificar se há respostas após a mensagem original (ou seja, se foi respondida)
        # Obter conversa e verificar se há mensagens mais recentes que a mensagem original
        conversation_messages = message.conversation.messages.filter(
            timestamp__gt=message.timestamp
        )

        # Se não houver mensagens após a mensagem original, é uma mensagem não respondida
        if not conversation_messages.exists():
            # Enviar notificação para os participantes exceto o remetente
            for participant in message.conversation.participants.exclude(id=message.sender.id):
                if should_send_notification(participant, 'new_message'):
                    Notification.objects.create(
                        user=participant,
                        title="Mensagem Urgente",
                        message=f"Você tem uma mensagem não respondida de {message.sender.name} há mais de 24h: {message.content[:50]}...",
                        notification_type='new_message'
                    )