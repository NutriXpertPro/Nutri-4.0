#!/usr/bin/env python3
"""
Script para analisar o conteúdo do arquivo medidas_alimentos.json
"""

import json
import os

def analyze_json_structure(filepath):
    """Analisa a estrutura do arquivo JSON"""
    try:
        # Ler os primeiros caracteres para inspecionar
        with open(filepath, 'r', encoding='utf-8') as f:
            # Ler os primeiros 1000 caracteres
            first_part = f.read(1000)
            print("Primeiros 1000 caracteres do arquivo:")
            print(first_part[:500])
            print("...")
            print(first_part[500:])
            
        # Tentar carregar o JSON inteiro
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"\nTipo do objeto principal: {type(data)}")
        
        if isinstance(data, dict):
            print(f"Chaves principais: {list(data.keys())}")
            
            # Verificar se há campos nutricionais
            nutritional_keywords = ['proteina', 'carboidrato', 'lipidio', 'energia', 'calorias', 'kcal', 'gordura', 'fibra', 'calcio', 'ferro']
            
            def search_nutritional_fields(obj, path=""):
                if isinstance(obj, dict):
                    for key, value in obj.items():
                        current_path = f"{path}.{key}" if path else key
                        
                        # Verificar se a chave é um campo nutricional
                        if any(keyword in key.lower() for keyword in nutritional_keywords):
                            print(f"Campo nutricional encontrado: {current_path} = {value}")
                            
                        # Recursivamente verificar valores
                        search_nutritional_fields(value, current_path)
                        
                elif isinstance(obj, list) and obj:
                    # Verificar o primeiro elemento da lista
                    search_nutritional_fields(obj[0], f"{path}[0]")
                    
            search_nutritional_fields(data)
            
        elif isinstance(data, list):
            print(f"Quantidade de itens na lista: {len(data)}")
            if data:
                print(f"Tipo do primeiro item: {type(data[0])}")
                if isinstance(data[0], dict):
                    print(f"Chaves do primeiro item: {list(data[0].keys())}")
                    
    except json.JSONDecodeError as e:
        print(f"Erro de decodificação JSON: {e}")
        # Ler o arquivo como texto para ver o problema
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            print("Primeiras 10 linhas do arquivo:")
            for i, line in enumerate(lines[:10]):
                print(f"L{i+1}: {repr(line[:100])}")
    except Exception as e:
        print(f"Erro ao processar o arquivo: {e}")

def main():
    filepath = r"C:\Nutri 4.0\docs\medidas_alimentos.json"
    
    if not os.path.exists(filepath):
        print(f"Arquivo não encontrado: {filepath}")
        return
        
    print("Analisando o arquivo medidas_alimentos.json...")
    analyze_json_structure(filepath)

if __name__ == "__main__":
    main()