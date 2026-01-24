
import os
import django
import sys
import logging
import re

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTBCA
from django.db import transaction

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("tbca_remediation_v3.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

KEYWORDS = {
    'FAT': ['óleo', 'azeite', 'manteiga', 'gordura', 'banha', 'maionese', 'margarina', 'castanha', 'nozes', 'amendoim'],
    'PROTEIN': ['carne', 'frango', 'peixe', 'ovo', 'queijo', 'leite', 'proteína', 'presunto', 'bovina', 'suína'],
    'CARB': ['arroz', 'batata', 'mandioca', 'farinha', 'pão', 'fruta', 'açúcar', 'macarrão', 'biscoito', 'banana', 'maçã', 'manga']
}

def classify_food_smart(name):
    name_low = name.lower()
    
    # 1. Check for "Without Fat Keywords"
    is_excluded_fat = False
    for k in KEYWORDS['FAT']:
        if k in name_low:
            if re.search(fr'(?:s/|sem)\W*{k}', name_low):
                is_excluded_fat = True
                break
    
    if not is_excluded_fat:
        for k in KEYWORDS['FAT']:
            if k in name_low: return 'FAT'

    # Protein Check
    for k in KEYWORDS['PROTEIN']:
        if k in name_low: return 'PROTEIN'

    # Default to CARB for everything else with starch names
    return 'CARB'

def fix_starch_bombs():
    logging.info("Pass 3: Correcting 'Starch the became Fat' bombs...")
    
    all_foods = AlimentoTBCA.objects.all()
    targets = []
    
    for f in all_foods:
        name = f.nome.lower()
        # Starch keywords
        if any(x in name for x in ['mandioca', 'arroz', 'batata', 'macarrão', 'pão']):
            # Logic: If it has high fat but also says "s/ óleo" or is a pure starch naturally
            if f.lipidios_g > 5 and f.carboidrato_g < 5:
                if 's/ óleo' in name or 'sem óleo' in name or 's/ gordura' in name or 'sem gordura' in name:
                    targets.append(f)
                elif any(x in name for x in ['cozida', 'assada', 'vapor']) and 'frito' not in name:
                    # Cozido/Assada starches shouldn't be 20g fat
                    targets.append(f)

    logging.info(f"Found {len(targets)} starch-heavy items that were wrongly classified as FAT.")
    
    updated = 0
    with transaction.atomic():
        for f in targets:
            kcal = float(f.energia_kcal)
            p = float(f.proteina_g or 0)
            
            # Reset fat to something realistic (0.1 to 0.5)
            f.lipidios_g = 0.25
            
            missing_energy = kcal - (p * 4 + f.lipidios_g * 9)
            f.carboidrato_g = round(max(0, missing_energy / 4.0), 2)
            f.save()
            updated += 1
            
    logging.info(f"Fixed {updated} starch fat bombs.")

def final_global_verify():
    logging.info("Ensuring NO zero macros in energy-dense foods (Clean up pass)...")
    
    foods = AlimentoTBCA.objects.filter(energia_kcal__gt=15, carboidrato_g=0, proteina_g=0, lipidios_g=0)
    count = foods.count()
    logging.info(f"Still found {count} items with 100% zero macros.")
    
    updated = 0
    for f in foods:
        cat = classify_food_smart(f.nome)
        kcal = float(f.energia_kcal)
        if cat == 'FAT': f.lipidios_g = round(kcal/9.0, 2)
        elif cat == 'PROTEIN': f.proteina_g = round(kcal/4.0, 2)
        else: f.carboidrato_g = round(kcal/4.0, 2)
        f.save()
        updated += 1
        
    logging.info(f"Applied final correction to {updated} records.")

if __name__ == "__main__":
    fix_starch_bombs()
    final_global_verify()
