from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import Payment


@receiver(post_save, sender=Payment)
def handle_payment_confirmation(sender, instance, **kwargs):
    if instance.status == "PAID" and instance.user.user_type == "nutricionista":
        user = instance.user
        if not user.is_active:
            user.is_active = True
            user.save()

            # Enviar email de boas-vindas
            subject = "Bem-vindo ao Nutri Xpert Pro!"
            message = render_to_string("emails/welcome_email.html", {"user": user})
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
