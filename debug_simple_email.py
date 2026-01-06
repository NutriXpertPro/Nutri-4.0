
import os
import sys
import django
import socket

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.conf import settings
    
    print("--- Configurações Lidas ---")
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    
    print("\n--- Testando Conexão TCP ---")
    try:
        socket.create_connection((settings.EMAIL_HOST, settings.EMAIL_PORT), timeout=10)
        print("OK: Conexão TCP estabelecida!")
    except Exception as e:
        print(f"ERRO: Falha na conexão TCP: {e}")
        
except Exception as e:
    print(f"ERRO: Falha ao carregar Django ou settings: {e}")
