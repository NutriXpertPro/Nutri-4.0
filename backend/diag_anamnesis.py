import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from anamnesis.models import Anamnesis, AnamnesisResponse

def diagnose():
    p = PatientProfile.objects.filter(user__name__icontains='Anderson').first()
    if not p:
        print("Paciente 'Anderson' nao encontrado.")
        return

    print(f"=== DIAGNOSTICO: {p.user.name} (ID: {p.id}) ===")
    
    # Anamnese Padrao
    a = getattr(p, 'anamnesis', None)
    if a:
        print("\n[ANAMNESE PADRAO]")
        print(f"Alergia Med: {a.alergia_medicamento}")
        print(f"Restricoes Alim: {a.alimentos_restritos}")
        print(f"Intolerancias Detalhes: {a.intolerancia_detalhes}")
        print(f"Uso Medicamentos (Bool): {a.uso_medicamentos}")
        print(f"Medicamentos Detalhes: {a.medicamentos_detalhes}")
    else:
        print("\n[ANAMNESE PADRAO] Nao encontrada.")

    # Anamnese Custom
    resp = p.anamnesis_responses.first()
    if resp:
        print("\n[ANAMNESE PERSONALIZADA]")
        print(f"Template: {resp.template.title}")
        print(f"Respostas: {resp.answers}")
    else:
        print("\n[ANAMNESE PERSONALIZADA] Nao encontrada.")

if __name__ == "__main__":
    diagnose()
