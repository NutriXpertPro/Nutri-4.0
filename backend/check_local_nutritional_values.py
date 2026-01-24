
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA

def check_food(name, source="TACO"):
    print(f"\n--- Verificando: {name} ({source}) ---")
    if source == "TACO":
        foods = AlimentoTACO.objects.filter(nome__icontains=name)
    else:
        foods = AlimentoTBCA.objects.filter(nome__icontains=name)
    
    if not foods.exists():
        print("Nenhum alimento encontrado.")
        return

    for food in foods[:3]: # Mostrar top 3
        print(f"ID: {food.id} | Nome: {food.nome}")
        print(f"  Energia: {food.energia_kcal} kcal")
        print(f"  Carboidratos: {food.carboidrato_g} g")
        print(f"  Proteínas: {food.proteina_g} g")
        print(f"  Lipídios: {food.lipidios_g} g")

# Alimentos para confrontar
check_food("batata, inglesa, cozida", "TACO")
check_food("batata, doce, cozida", "TACO")
check_food("batata", "TBCA") # Busca mais ampla na TBCA
check_food("frango, peito", "TACO") # Busca mais curta
check_food("ovo", "TACO") # Busca mais curta
check_food("arroz", "TACO") # Busca mais curta
check_food("feijão", "TACO") # Busca mais curta
check_food("mandioca", "TACO")
