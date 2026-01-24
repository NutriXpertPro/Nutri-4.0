#!/usr/bin/env python3
"""
Script para verificar se o arquivo medidas_alimentos.json contém dados nutricionais
"""

import json

def check_nutritional_data_in_json():
    """Verifica se o arquivo JSON contém dados nutricionais"""
    filepath = r"C:\Nutri 4.0\docs\medidas_alimentos.json"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            # Primeiro, ler uma parte pequena para verificar a estrutura
            f.seek(0)
            sample = f.read(2000)  # Ler os primeiros 2000 caracteres
            print("Amostra inicial do arquivo:")
            print(sample[:500])
            print("...")
            print(sample[500:1000])
            print("...")
            print(sample[1000:1500])
            
        # Agora tentar carregar o JSON
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"\nJSON carregado com sucesso!")
        print(f"Chaves principais: {list(data.keys())}")
        
        if 'alimentos' in data:
            print(f"\nTotal de alimentos: {len(data['alimentos'])}")
            
            # Verificar se há campos nutricionais em pelo menos um alimento
            nutritional_keywords = ['proteina', 'carboidrato', 'lipidio', 'energia', 'calorias', 'kcal', 'gordura', 'fibra', 'calcio', 'ferro', 'sodio']
            
            found_nutritional = False
            for i, food in enumerate(data['alimentos'][:5]):  # Verificar os primeiros 5
                if isinstance(food, dict):
                    print(f"\nAlimento {i+1}:")
                    print(f"  Chaves: {list(food.keys())}")
                    
                    for key in food.keys():
                        if any(nut_keyword in key.lower() for nut_keyword in nutritional_keywords):
                            print(f"    Campo nutricional encontrado: {key} = {food[key]}")
                            found_nutritional = True
            
            if found_nutritional:
                print("\n✓ O arquivo CONTÉM dados nutricionais!")
            else:
                print("\n✗ O arquivo NÃO contém campos nutricionais óbvios.")
                print("  Este arquivo parece conter apenas medidas caseiras, não composição nutricional.")
        else:
            print("\nChave 'alimentos' não encontrada no JSON.")
            
        # Verificar se há alguma menção a composição nutricional
        print(f"\nInformações adicionais do arquivo:")
        print(f"  Fonte: {data.get('fonte', 'Não especificado')}")
        print(f"  Descrição: {data.get('descricao', 'Não especificado')}")
        print(f"  Total de registros: {data.get('total_registros', 'Não especificado')}")
        print(f"  Total de alimentos: {data.get('total_alimentos', 'Não especificado')}")
        
    except Exception as e:
        print(f"Erro ao processar o arquivo: {e}")
        import traceback
        traceback.print_exc()

def main():
    print("Verificando se o arquivo medidas_alimentos.json contém dados nutricionais...")
    check_nutritional_data_in_json()

if __name__ == "__main__":
    main()