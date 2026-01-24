#!/usr/bin/env python3
"""
Script para investigar os alimentos de frango orgânico encontrados no IBGE
"""

import json

def investigate_organic_chicken():
    """Investiga os alimentos de frango orgânico encontrados no IBGE"""
    print("Investigando os alimentos de frango orgânico encontrados no IBGE")
    print("="*70)
    
    # Carregar o arquivo de medidas do IBGE
    with open('C:\\Nutri 4.0\\docs\\medidas_alimentos.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print('Dados encontrados para frango orgânico:')
    
    # Procurar pelos códigos específicos encontrados
    chicken_organic_codes = ['7805501', '7805702']
    
    for code in chicken_organic_codes:
        for food in data['alimentos']:
            if food['codigo'] == code:
                print(f'\nCódigo: {food["codigo"]}')
                print(f'Nome: {food["nome"]}')
                print(f'Medidas: {len(food["medidas"])} entradas')
                print('Exemplos de medidas:')
                for measure in food['medidas'][:5]:  # Mostrar as primeiras 5 medidas
                    print(f'  - {measure["medida"]}: {measure["quantidade_g"]}g ({measure["preparacao"]})')
                
                print(f'\nTotal de medidas para {food["nome"]}: {len(food["medidas"])}')
                break
    
    print("\nIMPORTANTE:")
    print("Os dados encontrados no arquivo 'medidas_alimentos.json' contêm apenas")
    print("MEDIDAS CASEIRAS e conversões para gramas, NÃO COMPOSIÇÃO NUTRICIONAL.")
    print("")
    print("Este arquivo indica como converter medidas caseiras (como 'unidade', 'fatia',")
    print("'colher de sopa', etc.) para gramas, mas NÃO fornece informações sobre")
    print("proteínas, carboidratos, lipídios ou outros nutrientes.")
    print("")
    print("Portanto, mesmo que o 'frango orgânico' esteja listado neste arquivo do IBGE,")
    print("ele NÃO contém os dados nutricionais necessários (como proteína).")

def main():
    investigate_organic_chicken()

if __name__ == "__main__":
    main()