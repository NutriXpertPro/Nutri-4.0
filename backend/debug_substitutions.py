"""
Script de Debug para Substituições de Alimentos
Execute: python debug_substitutions.py
"""
import os
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

import django
django.setup()

from diets.models import AlimentoTACO

def test_substitution(food_name, quantity_g=100):
    """Testa a lógica de substituição para um alimento"""
    print(f"\n{'='*60}")
    print(f"TESTANDO: {food_name} ({quantity_g}g)")
    print(f"{'='*60}")
    
    food_name_clean = food_name.strip()
    food_name_lower = food_name_clean.lower()
    
    print(f"\n1. Buscando na TACO:")
    
    taco_match = None
    
    # Strategy A: Exact match
    taco_match = AlimentoTACO.objects.filter(nome__iexact=food_name_clean).first()
    if taco_match:
        print(f"   ✓ Match exato encontrado!")
    
    # Strategy B: Match by first part (before comma)
    if not taco_match:
        first_part = food_name_clean.split(",")[0].strip()
        if first_part:
            taco_match = AlimentoTACO.objects.filter(nome__istartswith=first_part).first()
            if taco_match:
                print(f"   ✓ Encontrado por 'começa com': {first_part}")
    
    # Strategy C: Special handling for common foods
    if not taco_match:
        special_mappings = {
            "frango": "Frango, peito, sem pele, cru",
            "file de frango": "Frango, peito, sem pele, cru",
            "filé de frango": "Frango, peito, sem pele, cru",
            "peito de frango": "Frango, peito, sem pele, cru",
            "arroz branco": "Arroz, tipo 1, cozido",
            "arroz integral": "Arroz, integral, cozido",
            "feijao": "Feijão, carioca, cozido",
            "feijão": "Feijão, carioca, cozido",
            "ovo": "Ovo, de galinha, inteiro, cozido",
            "ovos": "Ovo, de galinha, inteiro, cozido",
            "batata": "Batata, inglesa, cozida",
            "batata doce": "Batata, doce, cozida",
        }
        for key, taco_name in special_mappings.items():
            if key in food_name_lower:
                taco_match = AlimentoTACO.objects.filter(nome__iexact=taco_name).first()
                if taco_match:
                    print(f"   ✓ Mapeamento especial: '{key}' → '{taco_name}'")
                    break
    
    # Strategy D: Search by significant word
    if not taco_match:
        words = food_name_clean.replace(",", " ").split()
        skip_words = ['de', 'da', 'do', 'com', 'sem', 'em', 'a', 'o', 'cru', 'cozido', 'frito', 'assado', 'grelhado', 'file', 'filé']
        significant = [w for w in words if w.lower() not in skip_words and len(w) > 2]
        if significant:
            taco_match = AlimentoTACO.objects.filter(nome__istartswith=significant[0]).first()
            if taco_match:
                print(f"   ⚠ Fallback por palavra: {significant[0]}")
    
    if not taco_match:
        print(f"   ERRO: Nenhum alimento encontrado na TACO!")
        return
    
    print(f"   Encontrado: {taco_match.nome}")
    print(f"   Grupo TACO: {taco_match.grupo}")
    print(f"   Por 100g: {taco_match.energia_kcal:.1f}kcal, {taco_match.proteina_g:.1f}g prot, {taco_match.carboidrato_g:.1f}g carb, {taco_match.lipidios_g:.1f}g fat")
    
    # 2. Classificar grupo pelo NOME ORIGINAL (não pelo match)
    def get_group(name):
        name = name.lower()
        if any(x in name for x in ['frango', 'peito', 'carne', 'bife', 'patinho', 'file', 'filé', 'peixe', 'atum', 'tilapia']):
            return 'PROTEIN_LEAN'
        if any(x in name for x in ['feijao', 'feijão', 'lentilha', 'grao de bico', 'grão-de-bico', 'ervilha']):
            return 'LEGUME'
        if any(x in name for x in ['arroz', 'macarrao', 'macarrão', 'batata', 'mandioca', 'aveia', 'pao', 'pão']):
            return 'CARB'
        if any(x in name for x in ['alface', 'rucula', 'couve', 'espinafre', 'agriao']):
            return 'LEAFY'
        return 'OTHER'
    
    item_group = get_group(food_name)
    print(f"\n2. Grupo do item original: {item_group}")
    
    # 3. Base values per 100g
    base_kcal = taco_match.energia_kcal
    base_prot = taco_match.proteina_g
    base_carb = taco_match.carboidrato_g
    base_fat = taco_match.lipidios_g
    
    # 4. Buscar candidatos COM FILTROS
    from django.db.models import Q
    
    original_base = taco_match.nome.split(",")[0].split()[0].strip()
    print(f"   Excluindo: '{original_base}*'")
    
    if item_group == 'PROTEIN_LEAN':
        candidates = AlimentoTACO.objects.filter(
            Q(grupo__icontains='carnes') | Q(grupo__icontains='pescados') | Q(grupo__icontains='ovos')
        ).exclude(
            nome__istartswith=original_base
        ).exclude(
            nome__icontains='caldo'
        ).exclude(
            nome__icontains='linguica'
        ).order_by('nome')[:10]
        
    elif item_group == 'LEGUME':
        candidates = AlimentoTACO.objects.filter(
            grupo__icontains='leguminosas'
        ).exclude(
            nome__istartswith=original_base
        ).exclude(
            nome__icontains='amendoim'  # NÃO é leguminosa nutricional
        ).order_by('nome')[:10]
        
    elif item_group == 'CARB':
        candidates = AlimentoTACO.objects.filter(
            Q(grupo__icontains='cereais') | Q(grupo__icontains='tuberculos')
        ).exclude(
            nome__istartswith=original_base
        ).exclude(
            nome__icontains='biscoito'
        ).exclude(
            nome__icontains='bolo'
        ).exclude(
            nome__icontains='pipoca'
        ).order_by('nome')[:10]
        
    elif item_group == 'LEAFY':
        candidates = AlimentoTACO.objects.filter(
            Q(nome__icontains='alface') | Q(nome__icontains='rucula') |
            Q(nome__icontains='couve') | Q(nome__icontains='espinafre') |
            Q(nome__icontains='agriao') | Q(nome__icontains='chicoria')
        ).exclude(
            nome__istartswith=original_base
        ).order_by('nome')[:10]
    else:
        candidates = AlimentoTACO.objects.filter(
            grupo=taco_match.grupo
        ).exclude(
            nome__istartswith=original_base
        ).order_by('nome')[:10]
    
    # Diversificar
    seen_bases = {}
    diverse = []
    for c in candidates:
        c_base = c.nome.split(",")[0].split()[0].strip().lower()
        if c_base not in seen_bases:
            seen_bases[c_base] = 0
        if seen_bases[c_base] < 2:
            diverse.append(c)
            seen_bases[c_base] += 1
        if len(diverse) >= 6:
            break
    
    print(f"   Candidatos encontrados: {len(diverse)}")
    
    # 5. Calcular equivalência
    print(f"\n3. SUBSTITUIÇÕES (para {quantity_g}g do original):")
    print("-" * 60)
    
    # Macro dominance
    kcal_prot = base_prot * 4
    kcal_carb = base_carb * 4
    kcal_fat = base_fat * 9
    total = kcal_prot + kcal_carb + kcal_fat
    if total < 1:
        total = base_kcal
    
    pct_prot = kcal_prot / total
    pct_carb = kcal_carb / total
    
    for cand in diverse:
        if cand.energia_kcal and cand.energia_kcal > 0:
            if pct_prot > 0.30 and cand.proteina_g > 0:
                equiv_100g = (base_prot / cand.proteina_g) * 100
                method = "prot"
            elif pct_carb > 0.50 and cand.carboidrato_g > 0:
                equiv_100g = (base_carb / cand.carboidrato_g) * 100
                method = "carb"
            else:
                equiv_100g = (base_kcal / cand.energia_kcal) * 100
                method = "kcal"
            
            equiv_g = equiv_100g * (quantity_g / 100)
            print(f"   {cand.nome[:45]:<45} → {equiv_g:>6.1f}g [{method}]")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("TESTANDO LÓGICA DE SUBSTITUIÇÃO CORRIGIDA")
    print("="*60)
    
    test_substitution("Feijão, preto, cozido", 100)
    test_substitution("Filé de frango", 100)
    test_substitution("Arroz, integral, cozido", 100)
    test_substitution("Alface", 100)
