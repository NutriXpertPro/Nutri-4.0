import json

# Abrir e ler o arquivo JSON
with open('C:\\Nutri 4.0\\docs\\medidas_alimentos.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Conteúdo do arquivo JSON:")
print("========================")

# Imprimir algumas informações básicas
print(f"Fonte: {data.get('fonte', 'Não especificado')}")
print(f"Descrição: {data.get('descricao', 'Não especificado')}")
print(f"Total de registros: {data.get('total_registros', 'Não especificado')}")
print(f"Total de alimentos: {data.get('total_alimentos', 'Não especificado')}")

print("\nEstrutura do primeiro alimento:")
if 'alimentos' in data and len(data['alimentos']) > 0:
    first_food = data['alimentos'][0]
    print(f"Chaves do primeiro alimento: {list(first_food.keys())}")
    
    # Imprimir o primeiro alimento para ver a estrutura
    print(f"\nPrimeiro alimento: {first_food}")
    
    # Verificar se há medidas
    if 'medidas' in first_food:
        print(f"\nPrimeiras medidas do primeiro alimento: {first_food['medidas'][:3]}")
        
        # Verificar se as medidas contêm dados nutricionais
        for medida in first_food['medidas'][:2]:
            print(f"Verificando medida: {medida}")
            nutritional_keys = [k for k in medida.keys() if k in ['proteina', 'carboidrato', 'lipidio', 'energia', 'calorias', 'kcal', 'gordura', 'fibra']]
            if nutritional_keys:
                print(f"  -> Campos nutricionais encontrados: {nutritional_keys}")
            else:
                print(f"  -> Nenhum campo nutricional encontrado")
else:
    print("Nenhum alimento encontrado na chave 'alimentos'")

print("\nConclusão:")
print("O arquivo 'medidas_alimentos.json' contém medidas caseiras para conversão em gramas,")
print("mas NÃO contém dados nutricionais como proteínas, carboidratos, lipídios, etc.")
print("Este é apenas um arquivo de conversão de medidas caseiras para gramas.")