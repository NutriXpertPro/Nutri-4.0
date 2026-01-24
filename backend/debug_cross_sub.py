
import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTBCA, AlimentoTACO, FoodSubstitutionRule
from diets.views import FoodSubstitutionRuleViewSet

def debug():
    v = FoodSubstitutionRuleViewSet()
    
    # User's items
    # "frango peito sem pele cozido"
    # "Manga, polpa, congelada"
    
    frango = AlimentoTBCA.objects.filter(nome__icontains='frango').filter(nome__icontains='peito').filter(nome__icontains='cozido').first()
    if not frango:
        frango = AlimentoTACO.objects.filter(nome__icontains='frango').filter(nome__icontains='peito').first()
        
    manga = AlimentoTBCA.objects.filter(nome__icontains='Manga').filter(nome__icontains='polpa').first()
    
    print(f"Frango Found: {frango.nome if frango else 'NOT FOUND'}")
    if frango:
        print(f"  Source: {frango.__class__.__name__} | ID: {frango.id}")
        print(f"  Group: {v._get_professional_group(frango)}")
        
    print(f"Manga Found: {manga.nome if manga else 'NOT FOUND'}")
    if manga:
        print(f"  Source: {manga.__class__.__name__} | ID: {manga.id}")
        print(f"  Group: {v._get_professional_group(manga)}")
        
    # Check if Manga appears in general rules for Protein
    rules = FoodSubstitutionRule.objects.filter(substitute_food_id=str(manga.id) if manga else '0')
    print(f"Rules pointing to Mango: {rules.count()}")
    for r in rules:
        print(f"  RuleID: {r.id} | From: {r.original_food_name} | Predominant: {r.nutrient_predominant}")

    # Simulate Suggest Call logic for fallback
    # predominantly protein?
    predominant = 'protein'
    diet_type = 'normocalorica'
    
    fallback_query = FoodSubstitutionRule.objects.filter(
            diet_type=diet_type, nutrient_predominant=predominant, is_active=True
        ).order_by("-similarity_score", "priority")[:60]
        
    print(f"Fallback query contains Mango? {any(str(manga.id) == r.substitute_food_id for r in fallback_query) if manga else 'N/A'}")
    
    # Find the EXACT rule that brought Mango
    if manga:
        matching_rule = [r for r in fallback_query if str(manga.id) == r.substitute_food_id]
        if matching_rule:
            r = matching_rule[0]
            print(f"MATCHING RULE: ID {r.id} | Orig: {r.original_food_name} | Subst: {r.substitute_food_name}")

if __name__ == "__main__":
    debug()
