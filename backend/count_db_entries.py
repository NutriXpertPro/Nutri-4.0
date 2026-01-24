
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA

print(f"TACO: {AlimentoTACO.objects.count()} alimentos")
print(f"TBCA: {AlimentoTBCA.objects.count()} alimentos")
print(f"USDA: {AlimentoUSDA.objects.count()} alimentos")
