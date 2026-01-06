
import smtplib
import ssl
import os
import sys

# Simular o que o test_port_465.py fez mas tentando avançar para o login
HOST = 'smtp.gmail.com'
PORT = 465
USER = 'andersoncarlosvp@gmail.com'
# Vou ler a senha do environment que o decouple deve ter carregado ou do .env diretamente
import sys
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
import django
django.setup()
from django.conf import settings

PASS = settings.EMAIL_HOST_PASSWORD

print(f"Testando conexão SSL manual no {HOST}:{PORT}...")
try:
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(HOST, PORT, context=context, timeout=15) as server:
        print("OK: Conectado via SSL!")
        server.ehlo()
        print("OK: EHLO bem sucedido!")
        print(f"Tentando login para {USER}...")
        server.login(USER, PASS)
        print("OK: LOGIN bem sucedido!")
        
        # Agora o teste real com Django
        from django.core.mail import send_mail
        print("Tentando enviar via Django send_mail...")
        send_mail(
            "Teste de Sucesso Nutri 4.0",
            "A conexão SSL na porta 465 foi validada e está funcionando!",
            settings.DEFAULT_FROM_EMAIL,
            [USER],
            fail_silently=False
        )
        print("OK: E-MAIL ENVIADO PELO DJANGO!")
        
except Exception as e:
    print(f"ERRO: {e}")
