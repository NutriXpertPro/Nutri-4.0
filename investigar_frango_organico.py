#!/usr/bin/env python3
"""
Script para investigar o caso do frango orgânico e entender por que está sem dados de proteína
"""

import json

def investigate_chicken_org():
    """Investiga o caso do frango orgânico"""
    print("Investigação do caso do frango orgânico")
    print("="*50)
    
    # Primeiro, vamos verificar se o alimento existe em algum lugar
    sources = {
        'TACO': 'C:\\Nutri 4.0\\backend\\taco.json',
        'TBCA': 'C:\\Nutri 4.0\\backend\\tbca_alimentos.json',
        'USDA': 'C:\\Nutri 4.0\\backend\\usda_alimentos.json'
    }
    
    print("1. Verificando se o alimento 'frango orgânico' existe nas bases de dados...")
    
    found_anything = False
    for source, filepath in sources.items():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"\n  Procurando em {source}:")
            
            # Procurar por frango orgânico de forma mais ampla
            for item in data:
                if source == 'TACO':
                    name = item.get('description', '').lower()
                    protein = item.get('protein_g')
                    energy = item.get('energy_kcal')
                    lipid = item.get('lipid_g')
                    carb = item.get('carbohydrate_g')
                elif source == 'TBCA':
                    name = item.get('nome', '').lower()
                    protein = item.get('proteina_g')
                    energy = item.get('energia_kcal')
                    lipid = item.get('lipidios_g')
                    carb = item.get('carboidrato_g')
                elif source == 'USDA':
                    name = item.get('nome', '').lower()
                    protein = item.get('proteina_g')
                    energy = item.get('energia_kcal')
                    lipid = item.get('lipidios_g')
                    carb = item.get('carboidrato_g')
                
                # Procurar por variações de frango orgânico
                if any(term in name for term in ['frango organico', 'frango orgânico', 'frango org', 'organic chicken']):
                    print(f"    ✓ Encontrado: {item.get('description') or item.get('nome')}")
                    print(f"      Proteína: {protein}")
                    print(f"      Energia: {energy}")
                    print(f"      Lipídios: {lipid}")
                    print(f"      Carboidratos: {carb}")
                    found_anything = True
                    
        except Exception as e:
            print(f"    Erro ao ler {source}: {e}")
    
    if not found_anything:
        print("\n  ✗ Nenhum alimento com variação de 'frango orgânico' encontrado nas bases de dados.")
        print("\n  2. Verificando se há frango convencional para comparar:")
        
        # Verificar frango convencional
        for source, filepath in sources.items():
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                print(f"\n  Amostras de frango em {source}:")
                chicken_samples = []
                
                for item in data:
                    if source == 'TACO':
                        name = item.get('description', '').lower()
                        protein = item.get('protein_g')
                    elif source == 'TBCA':
                        name = item.get('nome', '').lower()
                        protein = item.get('proteina_g')
                    elif source == 'USDA':
                        name = item.get('nome', '').lower()
                        protein = item.get('proteina_g')
                    
                    if 'frango' in name and 'frango' not in name.split()[0:2]:  # Evitar falsos positivos
                        chicken_samples.append({
                            'name': item.get('description') or item.get('nome'),
                            'protein': protein
                        })
                        
                        if len(chicken_samples) >= 3:  # Pegar só os primeiros 3
                            break
                
                for sample in chicken_samples:
                    print(f"    - {sample['name']}: Proteína = {sample['protein']}")
                    
            except Exception as e:
                print(f"    Erro ao ler {source}: {e}")
    
    print("\n3. Conclusão:")
    print("   Se o alimento 'frango orgânico' não existe nas bases de dados,")
    print("   isso explicaria a ausência de dados nutricionais.")
    print("   ")
    print("   Se ele existe mas tem proteína zerada, pode ser:")
    print("   - Um erro de importação dos dados")
    print("   - Uma lacuna nos dados originais da fonte")
    print("   - Um erro de digitação ou codificação do nome")

def main():
    investigate_chicken_org()

if __name__ == "__main__":
    main()