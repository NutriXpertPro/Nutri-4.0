
import os
import django
import sys
import json

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
    "Agrião, cru"
]

results = []
for name in foods_to_check:
    f = AlimentoTACO.objects.filter(nome__icontains=name).first()
    if f:
        results.append({
            "nome": f.nome,
            "kcal": f.energia_kcal,
            "prot": f.proteina_g,
            "carb": f.carboidrato_g,
            "lip": f.lipidios_g,
            "unidade": f.unidade_caseira,
            "peso_unidade": f.peso_unidade_caseira_g
        })

print(json.dumps(results, indent=2))
