
import os
import sys
import django
import smtplib
import ssl

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.conf import settings
    
    print("--- Verificação Final ---")
    print(f"Backend: {settings.EMAIL_BACKEND}")
    print(f"Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"SSL: {settings.EMAIL_USE_SSL}, TLS: {settings.EMAIL_USE_TLS}")
    print(f"User: {settings.EMAIL_HOST_USER}")

    context = ssl.create_default_context()
    print("\nTentando conexão SMTP_SSL...")
    try:
        with smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT, context=context, timeout=30) as server:
            print("Conectado! Fazendo login...")
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            print("Login bem sucedido!")
            
            # Tentar enviar pelo Django agora
            from django.core.mail import send_mail
            print("Tentando enviar via Django send_mail...")
            send_mail(
                "Teste Final Nutri 4.0",
                "Se você recebeu isso, a configuração SSL na porta 465 está funcionando!",
                settings.DEFAULT_FROM_EMAIL,
                [settings.EMAIL_HOST_USER],
                fail_silently=False
            )
            print("OK: E-mail enviado com sucesso via Django!")
    except Exception as e:
        print(f"FALHA: {e}")
        
except Exception as e:
    print(f"ERRO DE SETUP: {e}")
