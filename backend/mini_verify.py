
import os
import sys
import django

os.environ['DJANGO_SETTINGS_MODULE'] = 'setup.settings'
sys.path.append(os.getcwd())
django.setup()

from diets.models import AlimentoTACO
from django.db.models import Q

def test(item_name, item_qty):
    taco = AlimentoTACO.objects.filter(nome__icontains=item_name).first()
    if not taco: return
    
    # Original values per 100g
    b_kcal, b_prot, b_carb, b_fat = taco.energia_kcal, taco.proteina_g, taco.carboidrato_g, taco.lipidios_g
    total = (b_prot * 4) + (b_carb * 4) + (b_fat * 9) or 1
    p_prot, p_carb = (b_prot * 4) / total, (b_carb * 4) / total
    
    print(f"\nOBJETIVO: {taco.nome} ({item_qty}g)")
    
    # Simple candidates logic
    cands = AlimentoTACO.objects.filter(grupo=taco.grupo).exclude(id=taco.id)[:3]
    for c in cands:
        if p_prot > 0.3: eq_100 = (b_prot / c.proteina_g) * 100
        elif p_carb > 0.5: eq_100 = (b_carb / c.carboidrato_g) * 100
        else: eq_100 = (b_kcal / c.energia_kcal) * 100
        
        eq_g = eq_100 * (item_qty / 100.0)
        
        # HOUSEHOLD FIX (REPLICATED FROM VIEWS)
        f_qty, f_unit = eq_g, "g"
        c_u = c.unidade_caseira.lower() if c.unidade_caseira else ""
        is_g = any(u in c_u for u in ["g", "grama", "ml"])
        if c.unidade_caseira and c.peso_unidade_caseira_g and not is_g:
            q_h = eq_g / c.peso_unidade_caseira_g
            if q_h >= 0.5: f_qty, f_unit = q_h, c.unidade_caseira
        
        print(f" -> {c.nome[:30]:<30}: {f_qty:>6.1f}{f_unit}")

if __name__ == "__main__":
    test("Feijão, preto, cozido", 100)
    test("Alface, crespa, crua", 100)
    test("Frango, peito, sem pele, cru", 100)
    test("Arroz, integral, cozido", 100)
