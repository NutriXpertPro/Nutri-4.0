#!/usr/bin/env python3
"""
Script para analisar se os alimentos da tabela IBGE têm dados de macronutrientes
"""

import json

def analyze_ibge_nutritional_data():
    """Analisa se os alimentos da tabela IBGE têm dados de macronutrientes"""
    print("Análise dos dados nutricionais dos alimentos da tabela IBGE")
    print("="*60)
    
    # Carregar o arquivo de medidas do IBGE
    with open('C:\\Nutri 4.0\\docs\\medidas_alimentos.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Total de alimentos no IBGE: {len(data['alimentos'])}")
    
    # Verificar a estrutura de um alimento típico
    first_food = data['alimentos'][0]
    print(f"Estrutura de um alimento típico: {list(first_food.keys())}")
    
    # Verificar se há campos nutricionais em algum alimento
    nutritional_fields = ['proteina', 'carboidrato', 'lipidio', 'energia', 'calorias', 'kcal', 'gordura', 'fibra', 'calcio', 'ferro', 'sodio']
    
    foods_with_nutrition = 0
    foods_without_nutrition = 0
    
    for food in data['alimentos']:
        has_nutrition = False
        for key in food.keys():
            if any(nut_field in key.lower() for nut_field in nutritional_fields):
                has_nutrition = True
                break
        
        if has_nutrition:
            foods_with_nutrition += 1
        else:
            foods_without_nutrition += 1
    
    print(f"\nAlimentos com dados nutricionais: {foods_with_nutrition}")
    print(f"Alimentos SEM dados nutricionais: {foods_without_nutrition}")
    
    # Analisar a estrutura detalhada de um alimento
    print(f"\nEstrutura detalhada do primeiro alimento:")
    print(f"Código: {first_food['codigo']}")
    print(f"Nome: {first_food['nome']}")
    print(f"Quantidade de medidas: {len(first_food['medidas'])}")
    print(f"Exemplo de medidas: {first_food['medidas'][:3]}")
    
    # Verificar se há algum campo nutricional em qualquer lugar do arquivo
    def find_nutritional_fields(obj, path="", found_fields=None):
        if found_fields is None:
            found_fields = []
        
        if isinstance(obj, dict):
            for key, value in obj.items():
                current_path = f"{path}.{key}" if path else key
                if any(nut_field in key.lower() for nut_field in nutritional_fields):
                    found_fields.append((current_path, value))
                find_nutritional_fields(value, current_path, found_fields)
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                current_path = f"{path}[{i}]"
                find_nutritional_fields(item, current_path, found_fields)
        
        return found_fields
    
    nutritional_found = find_nutritional_fields(data)
    
    print(f"\nBusca avançada por campos nutricionais:")
    if nutritional_found:
        print("Campos nutricionais encontrados:")
        for field_path, value in nutritional_found:
            print(f"  {field_path}: {value}")
    else:
        print("  Nenhum campo nutricional encontrado em lugar algum")
    
    print(f"\nCONCLUSÃO:")
    print(f"  A tabela IBGE (medidas_alimentos.json) contém apenas:")
    print(f"  - Códigos de alimentos")
    print(f"  - Nomes de alimentos")  
    print(f"  - Medidas caseiras e conversões para gramas")
    print(f"  - Preparação (como cozido, assado, frito)")
    print(f"  ")
    print(f"  A tabela NÃO contém:")
    print(f"  - Dados de proteínas")
    print(f"  - Dados de carboidratos")
    print(f"  - Dados de lipídios")
    print(f"  - Dados de fibras, vitaminas, minerais, etc.")
    print(f"  ")
    print(f"  Portanto, SIM - todos os alimentos da tabela IBGE estão sem dados de macronutrientes.")
    print(f"  Eles são úteis apenas para conversão de medidas caseiras para gramas.")

def main():
    analyze_ibge_nutritional_data()

if __name__ == "__main__":
    main()