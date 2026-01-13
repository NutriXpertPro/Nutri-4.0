import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from users.models import User
from patients.models import PatientProfile

def list_andersons():
    users = User.objects.filter(name__icontains='Anderson')
    print(f"Encontrados {users.count()} usuarios com 'Anderson':")
    for u in users:
        has_profile = hasattr(u, 'patient_profile')
        profile_id = u.patient_profile.id if has_profile else 'N/A'
        print(f"ID: {u.id} | Nome: {u.name} | Perfil ID: {profile_id}")
        
        if has_profile:
            p = u.patient_profile
            has_anamnesis = hasattr(p, 'anamnesis')
            num_responses = p.anamnesis_responses.count()
            print(f"  -> Tem Anamnese Padrao: {has_anamnesis}")
            print(f"  -> Num. Anamneses Personalizadas: {num_responses}")

if __name__ == "__main__":
    list_andersons()
