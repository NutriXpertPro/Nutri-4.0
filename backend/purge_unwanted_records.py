import os
import django

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import PatientProfile

def purge_unwanted():
    User = get_user_model()
    
    # Whitelist de e-mails para manter
    whitelist = [
        'andersoncarlosvp@gmail.com',      # Nutricionista
        'portes.angela09@gmail.com',       # Angela Cristina
        'bethbrito1952@gmail.com',         # Elizabeth Pereira
        'anderson_28vp@hotmail.com'        # Anderson Carlos
    ]
    
    print(f"Iniciando limpeza. Whitelist: {whitelist}")
    
    # 1. Deletar PatientProfiles que não estão na whitelist
    profiles_to_delete = PatientProfile.objects.exclude(user__email__in=whitelist)
    count_profiles = profiles_to_delete.count()
    for p in profiles_to_delete:
        print(f"Removendo perfil: {p.user.email}")
    profiles_to_delete.delete()
    
    # 2. Deletar Users (PACIENTE) que não estão na whitelist
    # Mantemos o nutricionista e os 3 pacientes da lista
    # Outros usuários do tipo 'paciente' ou sem tipo que não estão na lista são removidos
    users_to_delete = User.objects.exclude(email__in=whitelist)
    count_users = users_to_delete.count()
    for u in users_to_delete:
        print(f"Removendo usuário: {u.email} ({u.user_type})")
    users_to_delete.delete()
    
    print(f"--- FIM DA LIMPEZA ---")
    print(f"Perfis removidos: {count_profiles}")
    print(f"Usuários removidos: {count_users}")
    print(f"Restantes: {[u.email for u in User.objects.all()]}")

if __name__ == "__main__":
    confirm = input("Tem certeza que deseja apagar permanentemente todos os registros fora da whitelist? (sim/nao): ")
    if confirm.lower() == 'sim':
        purge_unwanted()
    else:
        print("Operação cancelada.")
