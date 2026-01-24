
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
        logging.FileHandler("tbca_remediation_v2.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

KEYWORDS = {
    'CARB': [
        'arroz', 'batata', 'mandioca', 'farinha', 'pão', 'pao', 'fruta', 'açúcar', 'acucar', 
        'macarrão', 'macarrao', 'biscoito', 'mel', 'doce', 'xarope', 'aveia', 'milho', 
        'cuscuz', 'tapioca', 'banana', 'maçã', 'maca', 'laranja', 'manga', 'uva', 'suco', 
        'refrigerante', 'geleia', 'abacaxi', 'abóbora', 'abobora', 'abobrinha', 'acelga', 
        'acerola', 'aipo', 'alcachofra', 'alcaparra', 'amora', 'araça', 'banana', 'bebida',
        'calda', 'cana', 'coco', 'glicose', 'melado', 'sagu'
    ],
    'PROTEIN': [
        'carne', 'frango', 'peixe', 'ovo', 'queijo', 'leite', 'proteína', 'proteina', 
        'whey', 'iogurte', 'presunto', 'mortadela', 'salame', 'bovina', 'suína', 'suina', 
        'peru', 'lombo', 'alcatra', 'maminha', 'patinho', 'tilápia', 'tilapia', 'pescada',
        'almôndega', 'almondega', 'apresuntado'
    ],
    'FAT': [
        'óleo', 'oleo', 'azeite', 'manteiga', 'gordura', 'castanha', 'nozes', 'amendoim', 
        'chia', 'linhaça', 'linhaca', 'abacate', 'margarina', 'banha', 'maionese'
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

def mass_recalculate():
    logging.info("Starting Advanced TBCA remediation (Pass 3)...")
    
    # We target records where discrepancy is > 15 kcal
    # This time we are more aggressive with distributing the "missing" energy.
    foods = AlimentoTBCA.objects.all()
    count_affected = 0
    
    with transaction.atomic():
        for f in foods:
            p = float(f.proteina_g or 0)
            c = float(f.carboidrato_g or 0)
            g = float(f.lipidios_g or 0)
            k = float(f.energia_kcal or 0)
            
            if k <= 5: continue # Ignore very low calorie foods
            
            calc_k = (p*4 + c*4 + g*9)
            diff = k - calc_k
            
            if abs(diff) > 12: # Threshold reduced to 12 for better coverage
                category = classify_food(f.nome)
                
                # If diff is positive, energy is missing. Add to predominant macro.
                if diff > 0:
                    if category == 'FAT':
                        f.lipidios_g += round(diff / 9.0, 2)
                    elif category == 'PROTEIN':
                        f.proteina_g += round(diff / 4.0, 2)
                    else: # CARB
                        f.carboidrato_g += round(diff / 4.0, 2)
                else:
                    # If diff is negative, macros exceed energy. Reduce predominant macro (clipping to 0).
                    # This is rarer in TBCA but possible.
                    reduction = abs(diff)
                    if category == 'FAT':
                        f.lipidios_g = max(0, f.lipidios_g - round(reduction / 9.0, 2))
                    elif category == 'PROTEIN':
                        f.proteina_g = max(0, f.proteina_g - round(reduction / 4.0, 2))
                    else: # CARB
                        f.carboidrato_g = max(0, f.carboidrato_g - round(reduction / 4.0, 2))
                
                f.save()
                count_affected += 1
                
                if count_affected % 200 == 0:
                    logging.info(f"Progress: Updated {count_affected} records.")

    logging.info(f"Advanced remediation finished. Total updated: {count_affected}")

if __name__ == "__main__":
    mass_recalculate()
