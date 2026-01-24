
import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO

foods_to_check = [
    "Feijão, preto, cozido",
    "Alface, crespa, crua",
    "Frango, peito, sem pele, cru",
    "Arroz, integral, cozido",
    "Macarrão, trigo, cru, com ovos",
    "Amendoim, torrado, salgado",
    "Agrião, cru",
    "Lentilha, cozida",
    "Peito de frango, sem pele, grelhado"
]

print(f"{'Nome':<40} | {'Kcal':<6} | {'Prot':<6} | {'Carb':<6} | {'Lip':<6} | {'Un.Caseira':<15} | {'Peso'}")
print("-" * 110)

for name in foods_to_check:
    f = AlimentoTACO.objects.filter(nome__icontains=name).first()
    if f:
        print(f"{f.nome[:40]:<40} | {f.energia_kcal:<6.1f} | {f.proteina_g:<6.1f} | {f.carboidrato_g:<6.1f} | {f.lipidios_g:<6.1f} | {f.unidade_caseira or 'None':<15} | {f.peso_unidade_caseira_g}")
    else:
        print(f"{name[:40]:<40} | NOT FOUND")
