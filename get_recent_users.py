
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def run():
    users = User.objects.all().order_by('-id')[:15]
    print(f"--- ULTIMOS USUARIOS ---")
    for u in users:
        print(f"ID: {u.id} | Email: {u.email} | Nome: {u.name} | Criado: {u.date_joined}")

if __name__ == "__main__":
    run()
