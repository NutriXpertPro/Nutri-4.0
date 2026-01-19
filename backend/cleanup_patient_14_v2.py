import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models_patient_data import ProgressPhoto
from patients.models import PatientProfile

def cleanup():
    patient_id = 14
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        # Deletar fotos de 2025 que estão causando confusão
        deleted_count, _ = ProgressPhoto.objects.filter(
            patient=patient, 
            uploaded_at__year=2025
        ).delete()
        
        print(f"Sucesso: {deleted_count} fotos antigas (2025) deletadas para o paciente {patient_id}.")
        
    except Exception as e:
        print(f"Erro: {str(e)}")

if __name__ == "__main__":
    cleanup()
