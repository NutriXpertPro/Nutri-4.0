
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTBCA, AlimentoTACO, FoodSubstitutionRule
from diets.views import FoodSubstitutionRuleViewSet

def scan_errant_rules():
    v = FoodSubstitutionRuleViewSet()
    rules = FoodSubstitutionRule.objects.filter(nutrient_predominant='protein')
    print(f"Scanning {rules.count()} PROTEIN rules...")
    
    found = 0
    for r in rules:
        subst_food = v._get_food_data(r.substitute_source, r.substitute_food_id)
        if subst_food:
            group = v._get_professional_group(subst_food)
            if group == 'FRUIT':
                print(f"ERRANT: ID {r.id} | From: {r.original_food_name} | TO: {r.substitute_food_name} ({group})")
                found += 1
                
    print(f"Scan finished. Total errant rules: {found}")

if __name__ == "__main__":
    scan_errant_rules()
