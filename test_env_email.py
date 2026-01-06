
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_current_credentials():
    print(f"Testing email with HOST: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"USE_SSL: {settings.EMAIL_USE_SSL}, USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"FROM: {settings.DEFAULT_FROM_EMAIL}")
    
    try:
        send_mail(
            'Teste Nutri 4.0 - Conexão Atual',
            'Se você recebeu este email, as configurações atuais do .env estão corretas.',
            settings.DEFAULT_FROM_EMAIL,
            ['andersoncarlosvp@gmail.com'],
            fail_silently=False,
        )
        print("SUCESSO: Email enviado com as configurações atuais!")
    except Exception as e:
        print(f"ERRO: Falha ao enviar email: {e}")

if __name__ == "__main__":
    test_current_credentials()
