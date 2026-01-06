
import os
import sys
import django

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.conf import settings
    from notifications.models import Notification
    
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    
    print("\n--- Ultimas 10 Notificações de Sistema ---")
    notifications = Notification.objects.filter(notification_type="system").order_by('-created_at')[:10]
    for n in notifications:
        print(f"[{n.created_at}] {n.title}: {n.message}")
        
except Exception as e:
    print(f"ERRO: {e}")
