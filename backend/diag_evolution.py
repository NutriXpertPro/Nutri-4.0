import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models_patient_data import ProgressPhoto
from anamnesis.models import Anamnesis
from patients.models import PatientProfile

def diag():
    patient_id = 14
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        print(f"--- Diagnóstico Paciente {patient_id}: {patient.user.name} ---")
        
        anamnesis = Anamnesis.objects.filter(patient=patient).first()
        if anamnesis:
            print(f"Anamnese: criada em {anamnesis.created_at}, atualizada em {anamnesis.updated_at}")
            print(f"Fotos Anamnese: Frente={bool(anamnesis.foto_frente)}, Lado={bool(anamnesis.foto_lado)}, Costas={bool(anamnesis.foto_costas)}")
        else:
            print("Nenhuma anamnese encontrada.")
            
        print("\n--- ProgressPhotos ---")
        photos = ProgressPhoto.objects.filter(patient=patient).order_by('uploaded_at', 'id')
        for p in photos:
            print(f"ID: {p.id} | Ângulo: {p.angle} | Data: {p.uploaded_at} | Foto: {p.photo.name}")
            
    except Exception as e:
        print(f"Erro: {str(e)}")

if __name__ == "__main__":
    diag()
