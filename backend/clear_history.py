
import os
import django
import sys

# Add the project root to the python path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from messages.models import Message, Conversation

def clear_history():
    print("Deleting all messages...")
    Message.objects.all().delete()
    print("Deleting all conversations...")
    Conversation.objects.all().delete()
    print("History cleared successfully.")

if __name__ == '__main__':
    clear_history()
