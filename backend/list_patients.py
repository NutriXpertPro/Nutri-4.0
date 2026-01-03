import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User

def list_patients():
    # Encontrar o nutricionista principal
    try:
        nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
        print(f"Nutricionista encontrado: {nutri.email}")
    except User.DoesNotExist:
        print("Nutricionista não encontrado com o email andersoncarlosvp@gmail.com")
        return

    # Listar todos os pacientes do nutricionista
    patients = PatientProfile.objects.filter(nutritionist=nutri)
    print(f"Encontrados {patients.count()} pacientes para o nutricionista:")
    
    for patient in patients:
        print(f"ID: {patient.id}, Nome: {patient.user.name}, Email: {patient.user.email}")

if __name__ == "__main__":
    list_patients()