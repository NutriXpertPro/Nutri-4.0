import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from users.models import User
from patients.models import PatientProfile
from anamnesis.models import Anamnesis

print("=== Verificando pacientes e anamneses ===")

# Buscar todos os pacientes
patients = PatientProfile.objects.all()

print(f"\nTotal de pacientes: {patients.count()}")

# Procurar por pacientes com nomes que contenham "Anderson"
anderson_patients = PatientProfile.objects.filter(user__name__icontains='Anderson')

if anderson_patients.exists():
    print(f"\nEncontrados {anderson_patients.count()} pacientes com 'Anderson' no nome:")
    for patient in anderson_patients:
        print(f"  - ID: {patient.id}, Nome: {patient.user.name}, Email: {patient.user.email}")
        
        # Verificar se tem anamnese
        try:
            anamnesis = Anamnesis.objects.get(patient=patient)
            print(f"    [ANAMNESIS] Encontrada anamnese para este paciente (ID: {anamnesis.id})")
        except Anamnesis.DoesNotExist:
            print(f"    [ANAMNESIS] Nenhuma anamnese encontrada para este paciente")
else:
    print("\nNenhum paciente com 'Anderson' no nome encontrado")

# Listar todos os pacientes para ver se encontramos o nome
print(f"\nListando todos os pacientes (primeiros 20):")
for patient in patients[:20]:  # Apenas os primeiros 20 para não sobrecarregar
    print(f"  - ID: {patient.id}, Nome: {patient.user.name}, Email: {patient.user.email}")
    
    # Verificar se tem anamnese
    try:
        anamnesis = Anamnesis.objects.get(patient=patient)
        print(f"    [ANAMNESIS] Encontrada anamnese para este paciente (ID: {anamnesis.id})")
    except Anamnesis.DoesNotExist:
        print(f"    [ANAMNESIS] Nenhuma anamnese encontrada para este paciente")