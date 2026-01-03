from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from notifications.models import Notification

User = get_user_model()

@shared_task(bind=True, max_retries=3)
def send_welcome_email_task(self, user_id, nutritionist_name):
    """
    Envia e-mail de boas-vindas para o paciente com link de definição de senha.
    """
    try:
        user = User.objects.get(pk=user_id)
        
        # Gerar tokens para redefinição de senha
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Construir link (assumindo que o frontend tem essa rota)
        # TODO: Confirmar a rota exata no frontend. Geralmente é /auth/reset-password?uid=...&token=...
        reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"
        
        subject = f"Bem-vindx à sua jornada de transformação, {user.name}!"
        
        message = f"""
1 Olá {user.name},

Parabéns por dar o primeiro passo rumo à sua transformação e bem-estar! Estamos verdadeiramente felizes em tê-lo conosco nesta jornada.

Como nutricionista responsável pelo seu acompanhamento, tenho total confiança que juntos alcançaremos excelentes resultados. Seu compromisso com a saúde e o bem-estar é inspirador.

Para darmos continuidade ao seu processo, é importante que você defina sua senha de acesso ao nosso sistema. Isso garantirá sua privacidade e segurança, além de permitir que você acesse seus planos alimentares, evoluções e comuniquemos de forma eficaz.

Clique no link abaixo para definir sua senha e acessar sua conta:

{reset_link}

Estamos ansiosos para acompanhar seu progresso e celebrar cada conquista ao longo do caminho. Conte comigo com entusiasmo e dedicação durante todo o processo!

Com confiança no seu sucesso,
{nutritionist_name}

---
Esta é uma mensagem automática. Por favor, não responda diretamente a este e-mail.
"""
        
        # Enviar e-mail
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@nutrixpertpro.com',
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return f"Email enviado para {user.email}"
        
    except User.DoesNotExist:
        return f"Usuário {user_id} não encontrado."
    except Exception as e:
        # Reagendar tarefa em caso de erro (ex: falha na conexão SMTP)
        # exponential backoff: 30s, 60s, 120s setados no retry
        raise self.retry(exc=e, countdown=60)
