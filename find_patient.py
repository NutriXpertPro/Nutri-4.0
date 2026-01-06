
import os
import sys
import django

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from patients.models import PatientProfile
    
    patient = PatientProfile.objects.first()
    if patient:
        print(f"ID_PACIENTE: {patient.id}")
        print(f"ID_USUARIO: {patient.user.id}")
        print(f"EMAIL: {patient.user.email}")
    else:
        print("Nenhum paciente encontrado!")
        
except Exception as e:
    print(f"ERRO: {e}")
