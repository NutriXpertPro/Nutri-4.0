import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User

def list_all_users():
    # Listar todos os usuários
    users = User.objects.all()
    print(f"Encontrados {users.count()} usuários no sistema:")
    
    for user in users:
        print(f"ID: {user.id}, Nome: {user.name}, Email: {user.email}, Tipo: {user.user_type}")
        
        # Verificar se o usuário tem perfil de paciente
        try:
            patient_profile = user.patient_profile
            print(f"  -> Tem perfil de paciente: ID {patient_profile.id}, Nutricionista: {patient_profile.nutritionist.email if patient_profile.nutritionist else 'N/A'}")
        except:
            print("  -> Não tem perfil de paciente")
        print()

def list_all_patients():
    # Listar todos os perfis de pacientes
    patients = PatientProfile.objects.all()
    print(f"\nEncontrados {patients.count()} perfis de pacientes no sistema:")
    
    for patient in patients:
        print(f"ID: {patient.id}, Nome: {patient.user.name}, Email: {patient.user.email}, Nutricionista: {patient.nutritionist.email}")

if __name__ == "__main__":
    list_all_users()
    list_all_patients()