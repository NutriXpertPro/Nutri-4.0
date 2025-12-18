from diets.models import AlimentoTACO, AlimentoTBCA, AlimentoMedidaIBGE

def debug_search():
    search_term = "Arroz, tipo 1, cozido"
    print(f"--- Debugging Search for: '{search_term}' ---")

    # 1. Check TACO directly
    print("\n1. Buscando no TACO:")
    taco_item = AlimentoTACO.objects.filter(nome__icontains=search_term).first()
    if taco_item:
        print(f"Found TACO: {taco_item.nome}")
        print(f"  unidade_caseira: '{taco_item.unidade_caseira}'")
        print(f"  peso_unidade_caseira_g: {taco_item.peso_unidade_caseira_g}")
    else:
        print("Not found in TACO exactly.")
        # Try broader
        taco_qs = AlimentoTACO.objects.filter(nome__icontains="Arroz").filter(nome__icontains="cozido")
        print(f"  Broader search regex 'Arroz' + 'cozido': {taco_qs.count()} results.")
        if taco_qs.exists():
            first = taco_qs.first()
            print(f"  First: {first.nome}")
            print(f"    unidade_caseira: '{first.unidade_caseira}'")
            print(f"    peso_unidade_caseira_g: {first.peso_unidade_caseira_g}")
            taco_item = first # Use for next steps checking


    def is_invalid_measure(name):
        return not name or name.lower() in ['g', 'grama', 'gramas', 'ml', 'mililitro', 'l', 'litro', 'mg']

    # 2. Simulate View Logic for IBGE measure
    if taco_item:
        clean_name = taco_item.nome.split(',')[0].strip()
        print(f"\n2. Simulating View Logic with clean_name: '{clean_name}'")
        
        # Check invalid measure logic
        uc = taco_item.unidade_caseira
        if is_invalid_measure(uc):
            print(f"  TACO measure '{uc}' is INVALID. Would search IBGE.")
        else:
             print(f"  TACO measure '{uc}' is VALID.")

        matches = AlimentoMedidaIBGE.objects.filter(nome_alimento__icontains=clean_name)
        # Exclude trivial
        matches = matches.exclude(medida__nome__in=['Grama', 'Quilo', 'Litro', 'Mililitro', 'Miligrama'])
        
        print(f"  IBGE matches count (after trivial filter): {matches.count()}")
        
        if matches.exists():
            print("  Top matches:")
            priorities = ['Colher', 'Concha', 'Escumadeira', 'Xícara', 'Copo', 'Fatia', 'Unidade']
            best_match = None
            
            for priority in priorities:
                best_match = matches.filter(medida__nome__icontains=priority).first()
                if best_match:
                    print(f"  PRIORITY MATCH found: {best_match.medida.nome} - {best_match.peso_g}g")
                    break
            
            if not best_match:
                 match = matches.first()
                 print(f"  FALLBACK match: {match.medida.nome} - {match.peso_g}g")

        else:
            print("  No IBGE matches found after filtering.")
            
debug_search()
