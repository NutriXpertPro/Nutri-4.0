
import os
import sys
import django
import smtplib
import socket

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.conf import settings
    
    print(f"HOST: {settings.EMAIL_HOST}")
    print(f"PORT: {settings.EMAIL_PORT}")
    
    print("\n--- Iniciando SMTP Debug ---")
    try:
        # 1. Conexão
        print("1. Conectando...")
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
        server.set_debuglevel(2) # Nível máximo de debug
        print("2. EHLO...")
        server.ehlo()
        
        # 2. STARTTLS
        print("3. STARTTLS...")
        if server.has_extn('starttls'):
            print("   (Servidor suporta STARTTLS)")
            server.starttls()
            server.ehlo()
        else:
            print("   (Servidor NÃO suporta STARTTLS)")
            
        # 3. Login
        print("4. Login...")
        try:
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            print("   Login bem sucedido!")
        except smtplib.SMTPAuthenticationError:
            print("   ERRO: Falha na autenticação. Verifique o usuário e a senha de app.")
        except Exception as e:
            print(f"   ERRO no Login: {e}")
            
        server.quit()
    except socket.timeout:
        print("ERRO: Timeout na operação SMTP.")
    except Exception as e:
        print(f"ERRO geral SMTP: {e}")
        
except Exception as e:
    print(f"ERRO de Setup: {e}")
