
import os
import django
import sys
import logging
from django.db import transaction

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("remediation_all.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

KEYWORDS = {
    'CARB': [
        'arroz', 'batata', 'mandioca', 'farinha', 'pão', 'fruta', 'açúcar', 'macarrão', 
        'biscoito', 'mel', 'doce', 'xarope', 'aveia', 'milho', 'cuscuz', 'tapioca', 
        'banana', 'maçã', 'laranja', 'manga', 'uva', 'suco', 'refrigerante', 'geleia',
        'trigo', 'centeio', 'cevada', 'açucar'
    ],
    'PROTEIN': [
        'carne', 'frango', 'peixe', 'ovo', 'queijo', 'leite', 'proteína', 'whey', 
        'iogurte', 'presunto', 'mortadela', 'salame', 'bovina', 'suína', 'peru', 
        'lombo', 'alcatra', 'maminha', 'patinho', 'tilápia', 'pescada', 'pernil'
    ],
    'FAT': [
        'óleo', 'azeite', 'manteiga', 'gordura', 'castanha', 'nozes', 'amendoim', 
        'chia', 'linhaça', 'abacate', 'margarina', 'banha', 'maionese', 'azeitona'
    ]
}

def classify_food(name):
    name = name.lower()
    for k in KEYWORDS['FAT']:
        if k in name: return 'FAT'
    for k in KEYWORDS['PROTEIN']:
        if k in name: return 'PROTEIN'
    for k in KEYWORDS['CARB']:
        if k in name: return 'CARB'
    return 'CARB'

def remediate_model(model, model_name):
    logging.info(f"Starting remediation for {model_name}...")
    
    # Energy > 5 and all macros == 0
    targets = model.objects.filter(
        energia_kcal__gt=5, 
        carboidrato_g=0, 
        proteina_g=0, 
        lipidios_g=0
    )
    
    count = targets.count()
    logging.info(f"[{model_name}] Identified {count} target records for zero-macro fix.")
    
    updated_count = 0
    with transaction.atomic():
        for food in targets:
            category = classify_food(food.nome)
            kcal = float(food.energia_kcal)
            
            if category == 'FAT':
                food.lipidios_g = round(kcal / 9.0, 2)
            elif category == 'PROTEIN':
                food.proteina_g = round(kcal / 4.0, 2)
            else: # CARB
                food.carboidrato_g = round(kcal / 4.0, 2)
                
            food.save()
            updated_count += 1
            if updated_count % 100 == 0:
                logging.info(f"[{model_name}] Progress: {updated_count}/{count} fixed.")
    
    logging.info(f"[{model_name}] Remediation finished. Updated: {updated_count}")

    # Pass 2: Fixing obvious missing carbs (kcal exists, macros sum don't match, and carbs is zero)
    logging.info(f"[{model_name}] Starting Pass 2: Missing Carbs fix...")
    mismatch_qs = model.objects.filter(energia_kcal__gt=20, carboidrato_g=0)
    mismatch_count = 0
    
    with transaction.atomic():
        for f in mismatch_qs:
            p = float(f.proteina_g or 0)
            c = float(f.carboidrato_g or 0)
            g = float(f.lipidios_g or 0)
            k = float(f.energia_kcal or 0)
            calc_k = (p*4 + c*4 + g*9)
            
            if k - calc_k > 15: # Significant missing energy
                category = classify_food(f.nome)
                if category == 'CARB':
                    f.carboidrato_g = round((k - calc_k) / 4.0, 2)
                    f.save()
                    mismatch_count += 1
    
    logging.info(f"[{model_name}] Pass 2 finished. Updated: {mismatch_count}")

if __name__ == "__main__":
    remediate_model(AlimentoTACO, "TACO")
    remediate_model(AlimentoTBCA, "TBCA")
