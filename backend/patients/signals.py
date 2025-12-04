from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.models import Notification
from .models import PatientProfile


@receiver(post_save, sender=PatientProfile)
def create_patient_notification(sender, instance, created, **kwargs):
    """Cria uma notificação quando um novo paciente é criado."""
    if created:
        message = f"Novo paciente cadastrado: {instance.user.name}"
        Notification.objects.create(
            user=instance.nutritionist,  # Notifica o nutricionista
            message=message,
            type="APP",  # Notificação dentro do app
        )
