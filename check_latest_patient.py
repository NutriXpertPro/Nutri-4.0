
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import PatientProfile

User = get_user_model()

def check_latest_patient():
    print("--- Ultimos 5 Usuarios/Pacientes ---")
    users = User.objects.all().order_by('-date_joined')[:5]
    
    if not users:
        print("Nenhum usuario encontrado.")
        return
        
    for user in users:
        has_profile = hasattr(user, 'patient_profile')
        print(f"User: {user.email} | Nome: {user.name} | Ativo: {user.is_active} | Tipo: {user.user_type}")
        if has_profile:
            p = user.patient_profile
            print(f"  Perfil ID: {p.id} | Ativo: {p.is_active} | Criado em: {p.created_at}")
        else:
            print("  (Sem perfil de paciente)")
        print("-" * 20)

if __name__ == "__main__":
    check_latest_patient()
