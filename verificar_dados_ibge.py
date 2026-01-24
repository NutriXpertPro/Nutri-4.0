#!/usr/bin/env python3
"""
Script para verificar dados do IBGE relacionados a frango
"""

import json

def check_ibge_data():
    """Verifica os dados do IBGE por frango"""
    print("Verificando dados do IBGE por frango...")
    
    # Verificar o arquivo JSON de medidas
    try:
        with open('C:\\Nutri 4.0\\docs\\medidas_alimentos.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("\nArquivo: medidas_alimentos.json")
        print("Total de alimentos:", len(data.get('alimentos', [])))
        
        # Procurar por frango em alimentos
        chicken_foods = []
        for food in data.get('alimentos', []):
            if 'frango' in food.get('nome', '').lower():
                chicken_foods.append({
                    'codigo': food['codigo'],
                    'nome': food['nome']
                })
        
        print(f"\nEncontrados {len(chicken_foods)} alimentos com 'frango':")
        for food in chicken_foods[:10]:  # Mostrar os primeiros 10
            print(f"  - {food['codigo']}: {food['nome']}")
        
        # Procurar especificamente por frango orgânico
        organic_chicken = [f for f in chicken_foods if 'organico' in f['nome'].lower() or 'orgânico' in f['nome'].lower()]
        if organic_chicken:
            print(f"\nEncontrados {len(organic_chicken)} alimentos com 'frango orgânico':")
            for food in organic_chicken:
                print(f"  - {food['codigo']}: {food['nome']}")
        else:
            print("\nNenhum alimento com 'frango orgânico' encontrado")
            
    except Exception as e:
        print(f"Erro ao ler medidas_alimentos.json: {e}")
    
    # Verificar o arquivo raw
    try:
        print("\nArquivo: medidas_raw.txt")
        with open('C:\\Nutri 4.0\\docs\\medidas_raw.txt', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Procurar por frango no conteúdo
        lines = content.split('\n')
        chicken_lines = []
        for line in lines:
            if 'frango' in line.lower():
                chicken_lines.append(line.strip())
        
        print(f"Encontradas {len(chicken_lines)} linhas com 'frango':")
        for line in chicken_lines[:5]:  # Mostrar as primeiras 5
            print(f"  {line}")
        
        # Procurar por frango orgânico
        organic_lines = [line for line in chicken_lines if 'organico' in line.lower() or 'orgânico' in line.lower()]
        if organic_lines:
            print(f"\nEncontradas {len(organic_lines)} linhas com 'frango orgânico':")
            for line in organic_lines:
                print(f"  {line}")
        else:
            print("\nNenhuma linha com 'frango orgânico' encontrada")
            
    except Exception as e:
        print(f"Erro ao ler medidas_raw.txt: {e}")

def main():
    check_ibge_data()

if __name__ == "__main__":
    main()