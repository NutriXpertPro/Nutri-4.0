
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def real_app_test():
    print(f"--- TESTE REAL VIA DJANGO ({settings.EMAIL_HOST_USER}) ---")
    try:
        # Usar o mesmo link que o app usa
        msg = "Este e um e-mail REAL enviado pelo sistema Nutri 4.0 para validar o fluxo de boas-vindas."
        
        print("Chamando send_mail do Django...")
        res = send_mail(
            subject="Validacao de Sistema - Nutri 4.0",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['andersoncarlosvp@gmail.com'],
            fail_silently=False
        )
        print(f"Resultado: {res} (1 = sucesso)")
    except Exception as e:
        print(f"ERRO NO TESTE REAL: {e}")

if __name__ == "__main__":
    real_app_test()
