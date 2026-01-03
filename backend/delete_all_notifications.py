import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from notifications.models import Notification

def delete_all_notifications():
    # Contar notificações antes da exclusão
    total_notifications = Notification.objects.count()
    print(f"Total de notificações antes da exclusão: {total_notifications}")
    
    # Excluir todas as notificações
    deleted_count, _ = Notification.objects.all().delete()
    print(f"Total de notificações excluídas: {deleted_count}")

if __name__ == "__main__":
    delete_all_notifications()