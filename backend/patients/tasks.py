from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from notifications.models import Notification

User = get_user_model()

def file_log(msg):
    try:
        with open('email_debug.log', 'a', encoding='utf-8') as f:
            from datetime import datetime
            f.write(f"[{datetime.now()}] {msg}\n")
    except:
        pass

@shared_task(bind=True, max_retries=3)
def send_welcome_email_task(self, user_id, nutritionist_name):
    """
    Envia e-mail de boas-vindas para o paciente com link de definição de senha.
    """
    try:
        file_log(f"[TASK] Iniciando para user_id: {user_id}")
        user = User.objects.get(pk=user_id)
        file_log(f"[TASK] Usuario: {user.email}")

        # Gerar tokens para redefinição de senha
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Construir link no formato correto para o frontend (com parâmetros de query)
        reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"
        print(f"[DEBUG EMAIL] Link gerado: {reset_link}")

        subject = f"Bem-vindx à sua jornada de transformação, {user.name}!"

        message = f"""
Olá {user.name},

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
        from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@nutrixpertpro.com'
        file_log(f"[TASK] Preparando envio. From: {from_email}, To: {user.email}")
        file_log(f"[TASK] Link: {reset_link}")
        
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[user.email],
            fail_silently=False,
        )

        file_log(f"[TASK] SUCESSO e-mail enviado para {user.email}")
        return f"Email enviado para {user.email}"

    except User.DoesNotExist:
        error_msg = f"Usuário {user_id} não encontrado."
        print(error_msg)
        return error_msg
    except Exception as e:
        error_msg = f"[TASK] ERRO para {user_id}: {type(e).__name__}: {str(e)}"
        file_log(error_msg)
        # Reagendar tarefa em caso de erro (ex: falha na conexão SMTP)
        # exponential backoff: 60s, 120s, 240s
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
