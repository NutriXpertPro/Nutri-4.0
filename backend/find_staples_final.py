
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO

def find_food(name):
    print(f"\n--- {name} ---")
    foods = AlimentoTACO.objects.filter(nome__icontains=name)
    for f in foods[:5]:
        print(f"ID: {f.id} | {f.nome} | Kcal: {f.energia_kcal} | CHO: {f.carboidrato_g} | PTN: {f.proteina_g} | FAT: {f.lipidios_g}")

find_food("Arroz, branco, cozido")
find_food("Arroz, integral, cozido")
find_food("Frango, peito, sem pele, grelhado")
find_food("Ovo, de galinha, inteiro, cozido")
find_food("Mandioca, cozida")
