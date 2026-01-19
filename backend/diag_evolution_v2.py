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
    output = []
    try:
        patient = PatientProfile.objects.get(id=patient_id)
        output.append(f"--- Diagnóstico Paciente {patient_id}: {patient.user.name} ---")
        
        anamnesis = Anamnesis.objects.filter(patient=patient).first()
        if anamnesis:
            output.append(f"Anamnese ID: {anamnesis.pk}")
            output.append(f"Criada em: {anamnesis.created_at}")
            output.append(f"Atualizada em: {anamnesis.updated_at}")
            output.append(f"Fotos Anamnese: Frente={bool(anamnesis.foto_frente)}, Lado={bool(anamnesis.foto_lado)}, Costas={bool(anamnesis.foto_costas)}")
        else:
            output.append("Nenhuma anamnese encontrada.")
            
        output.append("\n--- ProgressPhotos ---")
        photos = ProgressPhoto.objects.filter(patient=patient).order_by('uploaded_at', 'id')
        if not photos.exists():
            output.append("Nenhuma foto de progresso encontrada.")
        for p in photos:
            output.append(f"ID: {p.id} | Ângulo: {p.angle} | Data: {p.uploaded_at} | Foto Path: {p.photo.name}")
            
    except Exception as e:
        output.append(f"Erro: {str(e)}")

    with open("diag_final.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))

if __name__ == "__main__":
    diag()
