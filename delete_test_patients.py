
import os
import django
import sys

# Setup Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from django.contrib.auth import get_user_model

User = get_user_model()

def delete_test_patients():
    # Buscar pacientes criados pelos testes anteriores e específicos solicitados
    # Emails: anderson_28vp@hotmail.com, paciente8856@teste.com
    # E padrão "Paciente Via API"
    from django.db.models import Q
    patients = User.objects.filter(
        Q(name__startswith="Paciente Via API") |
        Q(email="anderson_28vp@hotmail.com") |
        Q(email="paciente8856@teste.com") |
        Q(name__icontains="Teste 8856")
    )
    
    count = patients.count()
    if count == 0:
        print("Nenhum paciente de teste encontrado.")
        return

    print(f"Encontrados {count} pacientes de teste.")
    for p in patients:
        print(f"Deletando: {p.name} ({p.email})")
        p.delete()
    
    print("Exclusão concluída.")

if __name__ == "__main__":
    delete_test_patients()
