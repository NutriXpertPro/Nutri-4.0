import os
import sys
import django

# Configurar o ambiente Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def test_email():
    print("--- Teste de Envio de E-mail ---")
    
    # Verificar se as credenciais estão configuradas
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        print("Erro: Credenciais de email não configuradas.")
        print("Configure EMAIL_HOST_USER e EMAIL_HOST_PASSWORD no arquivo .env")
        return False
    
    # Tentar enviar um email de teste
    try:
        send_mail(
            subject="Teste de Email - Nutri 40",
            message="Este é um email de teste para verificar se o sistema de envio de emails está funcionando corretamente.",
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@nutrixpertpro.com',
            recipient_list=[settings.EMAIL_HOST_USER],  # Enviando para o próprio usuário para teste
            fail_silently=False,
        )
        print("Email de teste enviado com sucesso!")
        return True
    except Exception as e:
        print(f"Erro ao enviar email de teste: {e}")
        return False

if __name__ == '__main__':
    success = test_email()
    if success:
        print("\n[SUCCESS] O sistema de envio de emails está configurado corretamente!")
    else:
        print("\n[ERROR] Ocorreu um problema com o sistema de envio de emails.")