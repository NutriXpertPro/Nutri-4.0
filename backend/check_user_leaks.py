
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from messages.models import Conversation, Message
from users.models import User

name_query = "Anderson"
print(f"--- Deep check for user: {name_query} ---")
users = User.objects.filter(name__icontains=name_query, user_type='paciente')

for user in users:
    print(f"\nUser: {user.name} (ID: {user.id})")
    convs = Conversation.objects.filter(participants=user)
    print(f"  Is participant in {convs.count()} conversations:")
    
    for c in convs:
        parts = list(c.participants.all())
        parts_names = [p.name for p in parts]
        print(f"    - Conv ID {c.id}. Participants: {parts_names}")
        
        # Check messages in this conversation not from this user
        msgs = Message.objects.filter(conversation=c).exclude(sender=user)
        senders = msgs.values_list('sender__name', flat=True).distinct()
        print(f"      Data Leak Check: Seeing messages from: {list(senders)}")
