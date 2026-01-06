
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile

def list_patients():
    print("--- Todos os Perfis de Pacientes ---")
    profiles = PatientProfile.objects.all().order_by('-created_at')
    print(f"Total: {profiles.count()}")
    for p in profiles:
        print(f"ID: {p.id} | Email: {p.user.email} | Nome: {p.user.name} | Criado: {p.created_at}")

if __name__ == "__main__":
    list_patients()
