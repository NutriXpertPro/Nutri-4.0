import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User

def delete_remaining_test_users():
    # Emails dos pacientes de teste que precisam ser excluídos
    test_user_emails = [
        'portes.angela09@gmail.com',
        'paciente.teste2@example.com'
    ]
    
    for email in test_user_emails:
        try:
            # Encontrar o usuário com o email
            user = User.objects.get(email=email)
            print(f"Excluindo usuário: {user.name} (ID: {user.id}) - Email: {user.email}")
            
            # Excluir o usuário
            user.delete()
            print(f"Usuário {user.name} excluído com sucesso!")
        except User.DoesNotExist:
            print(f"Usuário com email '{email}' não encontrado")

if __name__ == "__main__":
    delete_remaining_test_users()