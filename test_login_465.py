
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
    
    HOST = 'smtp.gmail.com'
    PORT = 465
    USER = settings.EMAIL_HOST_USER
    PASS = settings.EMAIL_HOST_PASSWORD
    
    print(f"Testando Login SSL no {HOST}:{PORT} para {USER}...")
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(HOST, PORT, context=context, timeout=10) as server:
            server.login(USER, PASS)
            print("OK: Login SSL bem sucedido!")
    except Exception as e:
        print(f"ERRO: Falha no Login SSL: {e}")
        
except Exception as e:
    print(f"ERRO de Setup: {e}")
