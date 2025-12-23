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
            message = f"Novo paciente cadastrado: {patient_name}"
            Notification.objects.create(
                user=instance.nutritionist,  # Notifica o nutricionista
                message=message,
                type="APP",  # Notificação dentro do app
            )
        except Exception:
            # Em caso de erro, cria uma notificação genérica
            message = "Novo paciente cadastrado"
            Notification.objects.create(
                user=instance.nutritionist,
                message=message,
                type="APP",
            )
