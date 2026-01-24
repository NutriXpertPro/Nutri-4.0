import os
import django
import unicodedata

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from diets.models import AlimentoTACO
from diets.nutritional_substitution import GRUPOS_NUTRICIONAIS
from django.db.models import Q

def normalize_text(text):
    if not text: return ""
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf8").lower().strip()

print("="*60)
print("DEBUGGING FOOD MATCHING LOGIC")
print("="*60)

total_curated = 0
found_curated = 0

for group_name, data in GRUPOS_NUTRICIONAIS.items():
    print(f"\nScanning Group: {group_name}")
    print("-" * 40)
    for rec_name in data["alimentos_recomendados"]:
        total_curated += 1
        
        # Exact logic used in views_patient_data.py
        base_name = rec_name.split(',')[0]
        query = Q(nome__icontains=rec_name)
        
        matches = AlimentoTACO.objects.filter(query)
        count = matches.count()
        
        status = "✅ FOUND" if count > 0 else "❌ NOT FOUND"
        print(f"[{status}] '{rec_name}' -> Found {count} matches")
        
        if count == 0:
            # Try looser match for debug
            loose_query = Q(nome__icontains=base_name)
            loose_matches = AlimentoTACO.objects.filter(loose_query).count()
            print(f"      ↳ Looser match '{base_name}': {loose_matches} matches")
        else:
            found_curated += 1
            # Show top match
            print(f"      ↳ Example: {matches.first().nome}")

print("\n" + "="*60)
print(f"SUMMARY: Found {found_curated}/{total_curated} ({(found_curated/total_curated)*100:.1f}%)")
print("="*60)
