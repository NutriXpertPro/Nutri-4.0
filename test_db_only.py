
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

print("Tentando configurar Django...")
try:
    django.setup()
    print("Django setup OK.")
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    count = User.objects.count()
    print(f"Sucesso! Total de usuarios no banco: {count}")
except Exception as e:
    print(f"Falha: {e}")
