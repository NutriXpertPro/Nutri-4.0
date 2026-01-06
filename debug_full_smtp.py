
import os
import sys
import django
import smtplib
from email.mime.text import MIMEText

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.conf import settings
    
    print("--- Configurações ---")
    print(f"HOST: {settings.EMAIL_HOST}")
    print(f"PORT: {settings.EMAIL_PORT}")
    print(f"USER: {settings.EMAIL_HOST_USER}")
    
    print("\n--- Testando Login SMTP Manuel (smtplib) ---")
    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
        server.set_debuglevel(1)
        server.starttls()
        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        print("OK: Login SMTP bem sucedido!")
        
        # Tentar enviar um email real
        msg = MIMEText("Teste de conexão SMTP Nutri 4.0")
        msg['Subject'] = "Teste SMTP Nutri 4.0"
        msg['From'] = settings.DEFAULT_FROM_EMAIL
        msg['To'] = settings.EMAIL_HOST_USER
        
        server.send_message(msg)
        print("OK: Email enviado com sucesso via smtplib!")
        
        server.quit()
    except Exception as e:
        print(f"ERRO: Falha no processo SMTP: {e}")
        
except Exception as e:
    print(f"ERRO: Falha ao carregar Django ou settings: {e}")
