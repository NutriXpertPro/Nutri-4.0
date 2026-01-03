import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User

def delete_selected_patients():
    ids_to_delete = [2, 3, 4]
    print(f"Iniciando exclusão dos pacientes com IDs: {ids_to_delete}")
    
    for pid in ids_to_delete:
        try:
            patient = PatientProfile.objects.get(id=pid)
            user = patient.user
            name = user.name
            print(f"Deletando {name} (ID Perfil: {pid}, ID Usuário: {user.id})...")
            
            # Deletar o usuário (isso deve deletar o perfil via CASCADE, mas podemos ser explícitos)
            user.delete()
            print(f"Sucesso: {name} removido.")
        except PatientProfile.DoesNotExist:
            print(f"Aviso: Paciente com ID {pid} não encontrado.")
        except Exception as e:
            print(f"Erro ao deletar ID {pid}: {e}")

if __name__ == "__main__":
    delete_selected_patients()
