
import os
import django
import sys

sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def delete_anderson():
    print("Buscando paciente 'Anderson' para exclusão...")
    # Busca flexível por nome ou email
    patients = User.objects.filter(name__icontains='Anderson', user_type='paciente')
    
    count = patients.count()
    if count == 0:
        print("Nenhum paciente 'Anderson' encontrado.")
    else:
        print(f"Encontrados {count} paciente(s) com nome 'Anderson'.")
        for p in patients:
            print(f"Deletando: {p.name} ({p.email})")
            p.delete()
        print("Exclusão concluída.")

if __name__ == '__main__':
    delete_anderson()
