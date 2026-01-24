#!/usr/bin/env python3
"""
Script para investigar especificamente o caso do frango orgânico
"""

import json
import re

def search_for_chicken_org(files):
    """Procura por frango orgânico em todos os arquivos"""
    print("Procurando por frango orgânico nos arquivos de dados...")
    
    for source, filepath in files.items():
        print(f"\n--- Procurando em {source} ---")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            found_items = []
            for item in data:
                # Obter nome e campo de proteína dependendo da fonte
                if source == 'TACO':
                    name = item.get('description', '')
                    protein_field = item.get('protein_g')
                    energy_field = item.get('energy_kcal')
                    lipid_field = item.get('lipid_g')
                    carb_field = item.get('carbohydrate_g')
                elif source == 'TBCA':
                    name = item.get('nome', '')
                    protein_field = item.get('proteina_g')
                    energy_field = item.get('energia_kcal')
                    lipid_field = item.get('lipidios_g')
                    carb_field = item.get('carboidrato_g')
                elif source == 'USDA':
                    name = item.get('nome', '')
                    protein_field = item.get('proteina_g')
                    energy_field = item.get('energia_kcal')
                    lipid_field = item.get('lipidios_g')
                    carb_field = item.get('carboidrato_g')
                
                # Procurar por variações de frango orgânico
                name_lower = name.lower()
                if 'frango' in name_lower and 'organico' in name_lower:
                    found_items.append({
                        'name': name,
                        'protein': protein_field,
                        'energy': energy_field,
                        'lipid': lipid_field,
                        'carb': carb_field,
                        'full_item': item
                    })
            
            if found_items:
                print(f"Encontrados {len(found_items)} itens com 'frango' e 'organico':")
                for item in found_items:
                    print(f"  - {item['name']}")
                    print(f"    Proteína: {item['protein']}")
                    print(f"    Energia: {item['energy']}")
                    print(f"    Lipídios: {item['lipid']}")
                    print(f"    Carboidratos: {item['carb']}")
            else:
                print("  Nenhum item encontrado com 'frango' e 'organico'")
                
                # Procurar por frango em geral
                chicken_items = []
                for item in data:
                    if source == 'TACO':
                        name = item.get('description', '').lower()
                    elif source == 'TBCA':
                        name = item.get('nome', '').lower()
                    elif source == 'USDA':
                        name = item.get('nome', '').lower()
                    
                    if 'frango' in name and 'organico' not in name:
                        if source == 'TACO':
                            protein_field = item.get('protein_g')
                        elif source == 'TBCA':
                            protein_field = item.get('proteina_g')
                        elif source == 'USDA':
                            protein_field = item.get('proteina_g')
                        
                        chicken_items.append({
                            'name': item.get('description') or item.get('nome'),
                            'protein': protein_field
                        })
                
                if chicken_items:
                    print(f"  Encontrados {len(chicken_items)} itens com 'frango' (geral):")
                    for item in chicken_items[:3]:  # Mostrar apenas os 3 primeiros
                        print(f"    - {item['name']}: Proteína={item['protein']}")
        
        except FileNotFoundError:
            print(f"  Arquivo não encontrado: {filepath}")
        except json.JSONDecodeError:
            print(f"  Erro ao decodificar JSON: {filepath}")
        except Exception as e:
            print(f"  Erro ao processar {filepath}: {e}")

def main():
    files = {
        'TACO': 'C:\\Nutri 4.0\\backend\\taco.json',
        'TBCA': 'C:\\Nutri 4.0\\backend\\tbca_alimentos.json',
        'USDA': 'C:\\Nutri 4.0\\backend\\usda_alimentos.json'
    }
    
    search_for_chicken_org(files)

if __name__ == "__main__":
    main()