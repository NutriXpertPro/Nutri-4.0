import os
import sys
sys.path.append('.')

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

import django
django.setup()

from django.conf import settings

print("Testando configurações do Django:")
print(f"EMAIL_HOST_USER: '{settings.EMAIL_HOST_USER}'")
print(f"EMAIL_HOST_PASSWORD: '{settings.EMAIL_HOST_PASSWORD}'")
print(f"EMAIL_BACKEND: '{settings.EMAIL_BACKEND}'")
print(f"DEFAULT_FROM_EMAIL: '{settings.DEFAULT_FROM_EMAIL}'")
print(f"EMAIL_HOST: '{settings.EMAIL_HOST}'")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")