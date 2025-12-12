import os
import django
from django.contrib.auth import get_user_model

# Adicione o caminho do projeto ao sys.path
import sys
from pathlib import Path

# Supondo que este script está em backend/check_user.py
# O diretório base do Django é 'backend'
# BASE_DIR = Path(__file__).resolve().parent.parent # Se o script estivesse dentro de um app
BASE_DIR = Path(__file__).resolve().parent # O diretório 'backend'
sys.path.append(str(BASE_DIR))


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

email = "andersoncarlosvp@gmail.com"

try:
    user = User.objects.get(email=email)
    print(f"User found: {user.email}")
    print(f"User type: {user.user_type}")
except User.DoesNotExist:
    print(f"User with email {email} not found.")
except Exception as e:
    print(f"An error occurred: {e}")