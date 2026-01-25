
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
        logging.StreamHandler(sys.stdout)
    ]
)

# Definimos as correções para os alimentos mais comuns
# O objetivo é garantir que 1 unidade/colher tenha o peso real aproximado
CORE_SANITATION = [
    {
        'search': 'Ovo, de galinha, inteiro', 
        'uc': 'Unidade (médio)', 
        'peso': 50.0
    },
    {
        'search': 'Ovo, de galinha, gema', 
        'uc': 'Unidade (gema)', 
        'peso': 17.0
    },
    {
        'search': 'Ovo, de galinha, clara', 
        'uc': 'Unidade (clara)', 
        'peso': 33.0
    },
    {
        'search': 'Arroz, tipo 1, cozido', 
        'uc': 'Colher de arroz', 
        'peso': 25.0
    },
    {
        'search': 'Arroz, integral, cozido', 
        'uc': 'Colher de arroz', 
        'peso': 25.0
    },
    {
        'search': 'Feijão, comum, cozido', 
        'uc': 'Concha média', 
        'peso': 140.0
    },
    {
        'search': 'Frango, peito, sem pele, grelhado', 
        'uc': 'Filé médio', 
        'peso': 100.0
    },
    {
        'search': 'Contra-filé, sem gordura, grelhado', 
        'uc': 'Bife médio', 
        'peso': 100.0
    },
    {
        'search': 'Banana, prata, crua', 
        'uc': 'Unidade média', 
        'peso': 65.0
    },
    {
        'search': 'Maçã, fugi, com casca', 
        'uc': 'Unidade pequena', 
        'peso': 130.0
    }
]

def sanitize_foods():
    logging.info("Starting Core Data Sanitation...")
    
    total_updated = 0
    
    with transaction.atomic():
        for item in CORE_SANITATION:
            # TACO
            taco_matches = AlimentoTACO.objects.filter(nome__icontains=item['search'])
            for f in taco_matches:
                f.unidade_caseira = item['uc']
                f.peso_unidade_caseira_g = item['peso']
                f.save()
                total_updated += 1
                logging.info(f"[TACO] Updated: {f.nome} -> {item['uc']} ({item['peso']}g)")
            
            # TBCA
            tbca_matches = AlimentoTBCA.objects.filter(nome__icontains=item['search'])
            for f in tbca_matches:
                f.unidade_caseira = item['uc']
                f.peso_unidade_caseira_g = item['peso']
                f.save()
                total_updated += 1
                logging.info(f"[TBCA] Updated: {f.nome} -> {item['uc']} ({item['peso']}g)")

    logging.info(f"Sanitation finished. Total records updated: {total_updated}")

if __name__ == "__main__":
    sanitize_foods()
