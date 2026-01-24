
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTBCA, AlimentoTACO

def check_ids():
    print("--- TACO IDs ---")
    ids_taco = [410, 377, 358, 488, 432, 230, 346, 91, 86, 129, 88, 102]
    for i in ids_taco:
        f = AlimentoTACO.objects.filter(id=i).first()
        print(f"ID {i}: {f.nome if f else 'NOT FOUND'}")
        
    print("\n--- TBCA IDs ---")
    ids_tbca = [5196, 2691, 129, 230]
    for i in ids_tbca:
        f = AlimentoTBCA.objects.filter(id=i).first()
        print(f"ID {i}: {f.nome if f else 'NOT FOUND'}")

if __name__ == "__main__":
    check_ids()
