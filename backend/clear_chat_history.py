
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from messages.models import Conversation, Message

def clear_history():
    print("Iniciando limpeza de histórico de conversas...")
    
    conversations = Conversation.objects.all()
    count = conversations.count()
    
    if count == 0:
        print("Nenhuma conversa encontrada para excluir.")
        return

    conversations.delete()
    print(f"Sucesso! {count} conversas foram excluídas permanentemente.")
    
    # Verify
    remaining = Conversation.objects.count()
    print(f"Conversas restantes: {remaining}")
    remaining_msgs = Message.objects.count()
    print(f"Mensagens restantes: {remaining_msgs}")

if __name__ == "__main__":
    clear_history()
