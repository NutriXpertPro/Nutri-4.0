from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.models import Notification
from .models import PatientProfile


@receiver(post_save, sender=PatientProfile)
def create_patient_notification(sender, instance, created, **kwargs):
    """Cria uma notificação quando um novo paciente é criado."""
    if created:
        try:
            patient_name = getattr(instance.user, 'name', 'Paciente Desconhecido')
            if patient_name and patient_name.startswith('Paciente '):
                patient_name = patient_name[9:]  # Remove 'Paciente ' (9 caracteres)
            
            # Limpar o nome para evitar caracteres residuais
            patient_name = patient_name.strip()
            
            # Incluir ID no formato [ID:xxx] e [PID:xxx] para o frontend capturar
            message = f"Novo paciente cadastrado: {patient_name} [ID:{instance.id}] [PID:{instance.id}]"
            
            Notification.objects.create(
                user=instance.nutritionist,  # Notifica o nutricionista
                title="Novo Paciente",
                message=message,
                notification_type="system",  # Notificação do sistema/app
            )

            # Enviar email de boas-vindas
            from .tasks import send_welcome_email_task
            send_welcome_email_task.delay(instance.user.id, instance.nutritionist.name)
        except Exception:
            # Em caso de erro, cria uma notificação genérica
            Notification.objects.create(
                user=instance.nutritionist,
                title="Sistema",
                message="Novo paciente cadastrado",
                notification_type="system",
            )
