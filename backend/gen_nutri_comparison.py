
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA

def get_nutri(name, table="TACO"):
    if table == "TACO":
        food = AlimentoTACO.objects.filter(nome__icontains=name).first()
    else:
        food = AlimentoTBCA.objects.filter(nome__icontains=name).first()
    
    if food:
        return {
            "nome": food.nome,
            "kcal": float(food.energia_kcal),
            "cho": float(food.carboidrato_g),
            "ptn": float(food.proteina_g),
            "fat": float(food.lipidios_g)
        }
    return None

targets = [
    ("Arroz, integral, cozido", "TACO"),
    ("Arroz, branco, cozido", "TACO"),
    ("Feijão, preto, cozido", "TACO"),
    ("Batata, inglesa, cozida", "TACO"),
    ("Batata, doce, cozida", "TACO"),
    ("Mandioca, cozida", "TACO"),
    ("Frango, peito, sem pele, grelhado", "TACO"),
    ("Ovo, de galinha, cozido", "TACO"),
    ("Banana, prata, crua", "TACO"),
    ("Maçã, fuji, com casca, crua", "TACO")
]

print("| Alimento | Tabela | Kcal (Local) | CHO (Local) | PTN (Local) | FAT (Local) |")
print("| :--- | :---: | :---: | :---: | :---: | :---: |")

for name, table in targets:
    data = get_nutri(name, table)
    if data:
        print(f"| {data['nome']} | {table} | {data['kcal']:.1f} | {data['cho']:.1f} | {data['ptn']:.1f} | {data['fat']:.1f} |")
    else:
        # Tenta busca mais simples se falhar
        short_name = name.split(",")[0]
        data = get_nutri(short_name, table)
        if data:
             print(f"| {data['nome']} (Busca Simples) | {table} | {data['kcal']:.1f} | {data['cho']:.1f} | {data['ptn']:.1f} | {data['fat']:.1f} |")
        else:
            print(f"| {name} | {table} | NOT FOUND | - | - | - |")
