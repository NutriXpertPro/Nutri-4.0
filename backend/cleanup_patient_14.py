import os
import django
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile

def clean_patient_data(patient_id):
    try:
        profile = PatientProfile.objects.get(id=patient_id)
        print(f"Limpando dados do paciente: {profile.user.name} (ID: {profile.id})")
        
        with transaction.atomic():
            # 1. Avaliações Físicas
            count = profile.evaluations.count()
            profile.evaluations.all().delete()
            print(f"- {count} avaliações removidas.")

            # 2. Anamnese (OneToOne)
            if hasattr(profile, 'anamnesis'):
                profile.anamnesis.delete()
                print("- Anamnese padrão removida.")
            
            # Anamnese Respostas (JSON)
            count = profile.anamnesis_responses.count()
            profile.anamnesis_responses.all().delete()
            print(f"- {count} respostas de anamnese removidas.")

            # 3. Dietas / Meal Plans
            # Verificando related names comuns
            if hasattr(profile, 'meal_plans'):
                count = profile.meal_plans.count()
                profile.meal_plans.all().delete()
                print(f"- {count} planos alimentares removidos.")

            # 4. Consultas (Appointments)
            if hasattr(profile, 'appointments'):
                count = profile.appointments.count()
                profile.appointments.all().delete()
                print(f"- {count} consultas removidas.")

            # 5. Notas Clínicas
            count = profile.notes.count()
            profile.notes.all().delete()
            print(f"- {count} notas clínicas removidas.")

            # 6. Exames Externos
            if hasattr(profile, 'external_exams'):
                count = profile.external_exams.count()
                profile.external_exams.all().delete()
                print(f"- {count} exames externos removidos.")
            
            # 7. Diário
            if hasattr(profile, 'diary_entries'):
                count = profile.diary_entries.count()
                profile.diary_entries.all().delete()
                print(f"- {count} registros de diário removidos.")

            print("Limpeza concluída com sucesso.")

    except PatientProfile.DoesNotExist:
        print(f"Paciente com ID {patient_id} não encontrado.")
    except Exception as e:
        print(f"Erro ao limpar dados: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    clean_patient_data(14)
