import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from notifications.models import Notification
from users.models import User

def list_notifications():
    # Listar todas as notificações
    notifications = Notification.objects.all().order_by('-sent_at')
    print(f"Encontradas {notifications.count()} notificações no sistema:")
    
    for notification in notifications:
        print(f"ID: {notification.id}, Tipo: {notification.notification_type}, Título: {notification.title}")
        print(f"Mensagem: {notification.message}")
        print(f"Usuário relacionado: {notification.user.name if notification.user else 'N/A'}")
        print(f"Enviado em: {notification.sent_at}")
        print(f"Lida: {notification.is_read}")
        print("---")

if __name__ == "__main__":
    list_notifications()