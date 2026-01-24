
import os
import django
import sys
import logging

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
        logging.FileHandler("tbca_remediation.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

KEYWORDS = {
    'CARB': [
        'arroz', 'batata', 'mandioca', 'farinha', 'pão', 'fruta', 'açúcar', 'macarrão', 
        'biscoito', 'mel', 'doce', 'xarope', 'aveia', 'milho', 'cuscuz', 'tapioca', 
        'banana', 'maçã', 'laranja', 'manga', 'uva', 'suco', 'refrigerante', 'geleia'
    ],
    'PROTEIN': [
        'carne', 'frango', 'peixe', 'ovo', 'queijo', 'leite', 'proteína', 'whey', 
        'iogurte', 'presunto', 'mortadela', 'salame', 'bovina', 'suína', 'peru', 
        'lombo', 'alcatra', 'maminha', 'patinho', 'tilápia', 'pescada'
    ],
    'FAT': [
        'óleo', 'azeite', 'manteiga', 'gordura', 'castanha', 'nozes', 'amendoim', 
        'chia', 'linhaça', 'abacate', 'margarina', 'banha', 'maionese'
    ]
}

def classify_food(name):
    name = name.lower()
    
    # Priority 1: Fat (high energy density, usually very pure source if mismatched)
    for k in KEYWORDS['FAT']:
        if k in name:
            return 'FAT'
            
    # Priority 2: Protein
    for k in KEYWORDS['PROTEIN']:
        if k in name:
            return 'PROTEIN'
            
    # Priority 3: Carb
    for k in KEYWORDS['CARB']:
        if k in name:
            return 'CARB'
            
    # Default fallback
    return 'CARB'

def remediate_tbca():
    logging.info("Starting TBCA remediation...")
    
    # 1. Targets: Energy > 10 and (All macros == 0)
    # We focus on zero-macros first as they are the most obvious errors.
    targets = AlimentoTBCA.objects.filter(
        energia_kcal__gt=10, 
        carboidrato_g=0, 
        proteina_g=0, 
        lipidios_g=0
    )
    
    count = targets.count()
    logging.info(f"Identified {count} target records for zero-macro fix.")
    
    updated_count = 0
    
    with transaction.atomic():
        for food in targets:
            category = classify_food(food.nome)
            kcal = float(food.energia_kcal)
            
            old_vals = f"P:{food.proteina_g} C:{food.carboidrato_g} G:{food.lipidios_g}"
            
            if category == 'FAT':
                food.lipidios_g = round(kcal / 9.0, 2)
            elif category == 'PROTEIN':
                food.proteina_g = round(kcal / 4.0, 2)
            else: # CARB
                food.carboidrato_g = round(kcal / 4.0, 2)
                
            new_vals = f"P:{food.proteina_g} C:{food.carboidrato_g} G:{food.lipidios_g}"
            
            food.save()
            updated_count += 1
            
            if updated_count % 100 == 0:
                logging.info(f"Progress: {updated_count}/{count} fixed.")
                
    logging.info(f"Cleanup finished. Total updated: {updated_count}")

def fix_mismatches():
    """Second pass: Fix records where macros are present but sum doesn't match calories significantly"""
    logging.info("Starting pass 2: Mismatch correction...")
    
    # Discrepancy > 20% or > 50 kcal
    foods = AlimentoTBCA.objects.filter(energia_kcal__gt=50)
    mismatch_count = 0
    
    for f in foods:
        p = float(f.proteina_g or 0)
        c = float(f.carboidrato_g or 0)
        g = float(f.lipidios_g or 0)
        k = float(f.energia_kcal or 0)
        calc_k = (p*4 + c*4 + g*9)
        
        if abs(k - calc_k) > (k * 0.3) or abs(k - calc_k) > 50:
            # If carbs are 0 and it's a carb-heavy name, or protein is 0, etc.
            category = classify_food(f.nome)
            diff = k - calc_k
            
            if diff > 10: # We only add if there's missing energy
                if category == 'FAT' and g == 0:
                    f.lipidios_g = round(diff / 9.0, 2)
                elif category == 'PROTEIN' and p == 0:
                    f.proteina_g = round(diff / 4.0, 2)
                elif category == 'CARB' and c == 0:
                    f.carboidrato_g = round(diff / 4.0, 2)
                else:
                    # Generic add to most likely macro
                    if category == 'CARB': f.carboidrato_g += round(diff / 4.0, 2)
                    elif category == 'PROTEIN': f.proteina_g += round(diff / 4.0, 2)
                    else: f.lipidios_g += round(diff / 9.0, 2)
                
                f.save()
                mismatch_count += 1
                
    logging.info(f"Pass 2 finished. Total mismatches fixed: {mismatch_count}")

if __name__ == "__main__":
    remediate_tbca()
    fix_mismatches()
