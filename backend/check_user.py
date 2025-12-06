import os
import django

# Configure as configurações do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

try:
    user = User.objects.get(email='andersoncarlosvp@gmail.com', user_type='nutricionista')
    print(f"Nutricionista encontrado: {user.name} ({user.email})")
except User.DoesNotExist:
    print("Nutricionista 'andersoncarlosvp@gmail.com' não encontrado.")
except Exception as e:
    print(f"Ocorreu um erro: {e}")