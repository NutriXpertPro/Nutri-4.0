import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from notifications.models import Notification
from users.models import User

def delete_test_notifications():
    # Palavras-chave para identificar notificações de teste
    test_keywords = ['Angela Teste', 'Paciente Teste 2', 'Teste 2']
    
    for keyword in test_keywords:
        notifications = Notification.objects.filter(message__icontains=keyword)
        print(f"Encontradas {notifications.count()} notificações com a palavra '{keyword}':")
        
        for notification in notifications:
            print(f"  - ID: {notification.id}, Mensagem: {notification.message}")
            notification.delete()
            print(f"    Notificação excluída!")
    
    # Também excluir notificações com IDs específicos que vimos anteriormente
    specific_ids = [6, 7, 8]  # IDs das notificações mais recentes relacionadas aos testes
    for notification_id in specific_ids:
        try:
            notification = Notification.objects.get(id=notification_id)
            print(f"Excluindo notificação específica ID: {notification.id}, Mensagem: {notification.message}")
            notification.delete()
            print("  Notificação excluída!")
        except Notification.DoesNotExist:
            print(f"Notificação com ID {notification_id} não encontrada")

if __name__ == "__main__":
    delete_test_notifications()