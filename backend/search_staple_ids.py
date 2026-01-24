
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA

staple_foods = [
    "arroz, integral, cozido",
    "arroz, branco, cozido",
    "batata, doce, cozida",
    "batata, inglesa, cozida",
    "feijão, preto, cozido",
    "feijão, carioca, cozido",
    "frango, peito, grelhado, sem pele",
    "ovo, de galinha, cozido",
    "macarrão, trigo, cozido",
    "pão, forma, integral",
    "mandioca, cozida",
    "banana, prata, crua",
    "maçã, fuji, com casca, crua"
]

print("--- PESQUISA DE IDs (TACO) ---")
for food_name in staple_foods:
    taco = AlimentoTACO.objects.filter(nome__icontains=food_name).first()
    if taco:
        print(f"TACO | {food_name:30} | ID: {taco.id} | Código: {taco.codigo} | Nome Real: {taco.nome}")
    else:
        print(f"TACO | {food_name:30} | NOT FOUND")

print("\n--- PESQUISA DE IDs (TBCA) ---")
for food_name in staple_foods:
    tbca = AlimentoTBCA.objects.filter(nome__icontains=food_name).first()
    if tbca:
        print(f"TBCA | {food_name:30} | ID: {tbca.id} | Código: {tbca.codigo} | Nome Real: {tbca.nome}")
    else:
        print(f"TBCA | {food_name:30} | NOT FOUND")
