
import os
import django
import re

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from notifications.models import Notification
from patients.models import PatientProfile

def clean_notifications():
    print("Iniciando limpeza de notificações órfãs...")
    
    # Buscar todas as notificações do sistema que parecem ser de novos pacientes
    notifications = Notification.objects.filter(
        notification_type='system',
        message__contains='[PID:'
    )
    
    deleted_count = 0
    
    for notification in notifications:
        # Extrair o ID do paciente da mensagem
        match = re.search(r'\[PID:(\d+)\]', notification.message)
        if match:
            patient_id = int(match.group(1))
            
            # Verificar se o paciente ainda existe
            # Se não existir (hard deleted) OU se estiver inativo (soft deleted)
            # a notificação deve ser removida para evitar poluição visual
            
            exists = PatientProfile.objects.filter(id=patient_id).exists()
            is_active = False
            
            if exists:
                patient = PatientProfile.objects.get(id=patient_id)
                is_active = patient.is_active
            
            # Remover se não existe ou se está inativo
            if not exists or not is_active:
                print(f"Removendo notificação {notification.id}: Paciente {patient_id} (Existe: {exists}, Ativo: {is_active})")
                notification.delete()
                deleted_count += 1
                
    print(f"Limpeza concluída! {deleted_count} notificações removidas.")

if __name__ == '__main__':
    clean_notifications()
