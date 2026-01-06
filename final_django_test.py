
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def final_django_test():
    print(f"--- TESTE DJANGO INTEGRADO ---")
    print(f"Backend: {settings.EMAIL_BACKEND}")
    print(f"Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"User: {settings.EMAIL_HOST_USER}")
    print(f"SSL: {settings.EMAIL_USE_SSL} | TLS: {settings.EMAIL_USE_TLS}")
    print(f"Eager: {getattr(settings, 'CELERY_TASK_ALWAYS_EAGER', False)}")
    
    recipient = 'andersoncarlosvp@gmail.com'
    print(f"Tentando enviar para: {recipient}...")
    
    try:
        sent = send_mail(
            'Teste Final Nutri 4.0 - Django Setup',
            'Se este email chegou, a integracao Django estah 100% OK.',
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        print(f"SUCESSO! Retorno do send_mail: {sent}")
    except Exception as e:
        print(f"FALHA NO DJANGO: {type(e).__name__}: {e}")

if __name__ == "__main__":
    final_django_test()
