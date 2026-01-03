
import os
import django
import sys

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()

def clean_data():
    print("Iniciando limpeza de dados...")

    # 1. Excluir todos os pacientes
    patients = User.objects.filter(user_type='paciente')
    patient_count = patients.count()
    if patient_count > 0:
        print(f"Excluindo {patient_count} pacientes...")
        patients.delete()
        print("Pacientes excluídos.")
    else:
        print("Nenhum paciente encontrado para exclusão.")

    # 2. Excluir todas as notificações (para remover "fakes" antigos)
    # Isso eliminará notificações para nutricionistas sobre pacientes antigos
    notifications = Notification.objects.all()
    notification_count = notifications.count()
    if notification_count > 0:
        print(f"Excluindo {notification_count} notificações...")
        notifications.delete()
        print("Notificações excluídas.")
    else:
        print("Nenhuma notificação encontrada.")

    print("Limpeza concluída com sucesso.")

if __name__ == "__main__":
    clean_data()
