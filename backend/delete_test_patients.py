import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User

def delete_test_patients():
    # Encontrar o nutricionista principal
    try:
        nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
        print(f"Nutricionista encontrado: {nutri.email}")
    except User.DoesNotExist:
        print("Nutricionista não encontrado com o email andersoncarlosvp@gmail.com")
        return

    # Procurar e excluir os pacientes de teste
    test_patients_emails = {
        'Angela Teste': 'portes.angela09@gmail.com',
        'Paciente Teste 2': 'paciente.teste2@example.com'  # Email que definimos para o segundo paciente
    }

    for patient_name, patient_email in test_patients_emails.items():
        try:
            # Encontrar o usuário com o email do paciente
            patient_user = User.objects.get(email=patient_email)
            # Encontrar o perfil do paciente associado
            patient_profile = PatientProfile.objects.get(user=patient_user, nutritionist=nutri)
            print(f"Excluindo paciente: {patient_profile.user.name} (ID: {patient_profile.id}) - Email: {patient_email}")
            patient_profile.delete()
            print(f"Perfil de paciente {patient_profile.user.name} excluído com sucesso!")

            # Agora excluir o usuário também
            print(f"Excluindo usuário: {patient_user.name} (ID: {patient_user.id}) - Email: {patient_email}")
            patient_user.delete()
            print(f"Usuário {patient_user.name} excluído com sucesso!")
        except User.DoesNotExist:
            print(f"Usuário com email '{patient_email}' não encontrado")
        except PatientProfile.DoesNotExist:
            print(f"Paciente com email '{patient_email}' não encontrado para o nutricionista {nutri.email}")
        except Exception as e:
            print(f"Erro ao excluir paciente '{patient_name}' (email: {patient_email}): {str(e)}")

if __name__ == "__main__":
    delete_test_patients()