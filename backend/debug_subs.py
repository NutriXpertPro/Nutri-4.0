import os
import django
import sys

# Setup Django environment
sys.path.append('c:\\Nutri 4.0\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO

def test_logic(item_name, item_qty, item_kcal, item_prot, item_carb, item_fat):
    print(f"\n--- Testing: {item_name} ({item_qty}g) ---")
    print(f"Input: Kcal={item_kcal}, P={item_prot}, C={item_carb}, F={item_fat}")
    
    # Clean name logic from view
    clean_name = ''.join([i for i in item_name if i.isalpha() or i.isspace()]).strip()
    words = clean_name.split()
    search_term = words[0] if words else clean_name
    
    print(f"Search Term: {search_term}")
    
    taco_match = AlimentoTACO.objects.filter(nome__icontains=search_term).first()
    
    if not taco_match:
        print("No TACO match found.")
        return

    print(f"Match: {taco_match.nome} (Grupo: {taco_match.grupo})")
    
    candidates = AlimentoTACO.objects.filter(
        grupo=taco_match.grupo
    ).exclude(id=taco_match.id).order_by('?')[:5]
    
    # === SIMULATE SOURCE TRUTH RE-QUERY ===
    # Instead of trusting inputs, we use the taco_match values scaled by qty
    qty_ratio = float(item_qty) / 100.0
    src_kcal = taco_match.energia_kcal * qty_ratio
    src_prot = taco_match.proteina_g * qty_ratio
    src_carb = taco_match.carboidrato_g * qty_ratio
    src_fat = taco_match.lipidios_g * qty_ratio
    
    print(f"Source Truth (from TACO): Kcal={src_kcal:.1f}, P={src_prot:.1f}, C={src_carb:.1f}, F={src_fat:.1f}")

    # Calculate caloric contribution of each macro
    kcal_p = src_prot * 4
    kcal_c = src_carb * 4
    kcal_f = src_fat * 9
    total_calc_kcal = kcal_p + kcal_c + kcal_f
    
    
    if total_calc_kcal < 1:
        total_calc_kcal = src_kcal if src_kcal > 0 else 1

    pct_p = kcal_p / total_calc_kcal
    pct_f = kcal_f / total_calc_kcal
    pct_c = kcal_c / total_calc_kcal
    print(f"Macros breakdown: P={pct_p:.2f}, C={pct_c:.2f}, F={pct_f:.2f}")
    
    is_origin_junk = any(x in taco_match.grupo.lower() for x in ['industrializado', 'preparado'])

    for cand in candidates:
        if not cand.energia_kcal: continue
        
        # Filtering Junk
        is_candidate_junk = any(x in cand.grupo.lower() for x in ['industrializado', 'preparado', 'sanduíche', 'salgado'])
        if is_candidate_junk and not is_origin_junk:
            print(f"  -> Skipping Junk Candidate: {cand.nome} ({cand.grupo})")
            continue
            
        final_qty = 0
        matched_by = "unknown"
        
        if pct_p > 0.30 and cand.proteina_g > 0:
            # Match Protein
            final_qty = (src_prot / cand.proteina_g) * 100
            matched_by = 'protein'
            debug_val = cand.proteina_g
        elif pct_c > 0.50 and cand.carboidrato_g > 0:
            # Match Carbs
            final_qty = (src_carb / cand.carboidrato_g) * 100
            matched_by = 'carbs'
            debug_val = cand.carboidrato_g
        elif pct_f > 0.50 and cand.lipidios_g > 0:
            # Match Fats
            final_qty = (src_fat / cand.lipidios_g) * 100
            matched_by = 'fat'
            debug_val = cand.lipidios_g
        else:
            # Fallback to Calories
            final_qty = (src_kcal / cand.energia_kcal) * 100
            matched_by = 'calories'
            debug_val = cand.energia_kcal
        
        print(f"  -> Candidate: {cand.nome}")
        print(f"     Matched by {matched_by}: SourceVal={getattr(src_prot if matched_by=='protein' else src_carb if matched_by=='carbs' else item_fat, '__float__', src_kcal):.1f}, Cand/100g={debug_val}")
        print(f"     Raw Result: {final_qty}g")

# Test Cases from User Report
# Feijão (approx values for 100g cooked)
test_logic("Feijão preto cozido", 100, 77, 4.8, 14, 0.5)

# Filé de frango
test_logic("Filé de frango", 100, 160, 32, 0, 2.5)

# Arroz
test_logic("Arroz integral cozido", 100, 110, 2.6, 22, 1)

