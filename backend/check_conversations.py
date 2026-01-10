
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from messages.models import Conversation
from users.models import User

print("--- Analysis of Conversations ---")
conversations = Conversation.objects.all()

for conv in conversations:
    participants = list(conv.participants.all())
    patient_participants = [p for p in participants if p.user_type == 'paciente']
    nutri_participants = [p for p in participants if p.user_type == 'nutritionist']
    
    print(f"Conversation {conv.id}: {len(participants)} participants")
    print(f"  - Nutritionists: {[p.name for p in nutri_participants]}")
    print(f"  - Patients: {[p.name for p in patient_participants]}")
    
    if len(patient_participants) > 1:
        print("  [WARNING] Multiple patients in this conversation! This is likely the data leak.")
    
    if len(participants) == 0:
        print("  [WARNING] Empty conversation.")

print("\n--- Check User 'Anderson' ---")
andersons = User.objects.filter(name__icontains='Anderson')
for u in andersons:
    print(f"ID: {u.id}, Name: {u.name}, Type: {u.user_type}, Email: {u.email}")
