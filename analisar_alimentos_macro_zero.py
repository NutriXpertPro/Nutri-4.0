import json
import os

def load_food_data(file_path):
    """Carrega os dados de alimentos de um arquivo JSON."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def is_valid_zero_macro(food_item, macro_type):
    """
    Verifica se é válido um macronutriente ter valor zero com base no tipo de alimento.
    Retorna True se for aceitável que o macronutriente seja zero.
    """
    if isinstance(food_item, dict):
        food_name = food_item.get('description', food_item.get('nome', '')).lower()
    else:
        food_name = str(food_item).lower()

    # Açúcar e adoçantes geralmente não têm proteína
    sugar_like_foods = ['açúcar', 'adocante', 'sweetener', 'sacarose', 'frutose', 'glicose', 'xarope']
    if any(sugar_word in food_name for sugar_word in sugar_like_foods):
        if macro_type == 'proteina':
            return True  # É normal açúcar não ter proteína
    
    # Óleos e gorduras geralmente não têm proteína nem carboidrato
    oil_like_foods = ['óleo', 'oleo', 'manteiga', 'butter', 'gordura', 'fat', 'margarina']
    if any(oil_word in food_name for oil_word in oil_like_foods):
        if macro_type in ['proteina', 'carboidrato']:
            return True  # É normal óleos não terem proteína nem carboidrato
    
    # Carnes magras podem ter carboidratos muito baixos (próximo de zero)
    meat_like_foods = ['carne', 'frango', 'peixe', 'fish', 'beef', 'chicken', 'pork', 'bovina', 'suína']
    if any(meat_word in food_name for meat_word in meat_like_foods):
        if macro_type == 'carboidrato':
            return True  # É normal carnes terem carboidratos muito baixos
    
    # Leguminosas e grãos geralmente têm proteína, então zero seria suspeito
    protein_rich_foods = ['feijão', 'feijao', 'lentilha', 'grão', 'graodebico', 'tofu', 'tempeh', 'ovo', 'egg']
    if any(protein_word in food_name for protein_word in protein_rich_foods):
        if macro_type == 'proteina':
            return False  # Não é normal alimentos ricos em proteína terem zero
    
    # Carboidratos como arroz, pão, massas geralmente têm carboidratos altos
    carb_rich_foods = ['arroz', 'pão', 'pan', 'bread', 'massa', 'macarrão', 'macarrao', 'pasta', 'batata']
    if any(carb_word in food_name for carb_word in carb_rich_foods):
        if macro_type == 'carboidrato':
            return False  # Não é normal alimentos ricos em carboidratos terem zero
    
    # Verduras e vegetais folhosos podem ter proteína muito baixa
    veggie_foods = ['alface', 'espinafre', 'couve', 'brocolis', 'brócolis', 'folha', 'leafy', 'lettuce']
    if any(veggie_word in food_name for veggie_word in veggie_foods):
        if macro_type == 'proteina':
            return True  # Verduras podem ter proteína muito baixa
    
    # Por padrão, assume que não é normal ter zero
    return False

def analyze_food_macros(food_data, source_name):
    """
    Analisa os dados de alimentos e identifica quais têm macronutrientes zerados de forma inadequada.
    """
    problematic_foods = []
    
    for food in food_data:
        try:
            # Determinar os nomes dos campos com base na fonte
            if source_name == "TACO":
                food_name = food.get('description', 'Nome não disponível')
                protein_val = food.get('protein_g', 0)
                lipid_val = food.get('lipid_g', 0)
                carb_val = food.get('carbohydrate_g', 0)
            elif source_name == "TBCA":
                food_name = food.get('nome', 'Nome não disponível')
                protein_val = food.get('proteina_g', 0)
                lipid_val = food.get('lipidios_g', 0)
                carb_val = food.get('carboidrato_g', 0)
            elif source_name == "USDA":
                food_name = food.get('nome', 'Nome não disponível')
                protein_val = food.get('proteina_g', 0)
                lipid_val = food.get('lipidios_g', 0)
                carb_val = food.get('carboidrato_g', 0)
            
            # Converter valores para número se forem strings
            if isinstance(protein_val, str) and protein_val.lower() in ['na', 'null', '', 'tr']:
                protein_val = 0
            elif isinstance(protein_val, str):
                try:
                    protein_val = float(protein_val)
                except ValueError:
                    protein_val = 0
            
            if isinstance(lipid_val, str) and lipid_val.lower() in ['na', 'null', '', 'tr']:
                lipid_val = 0
            elif isinstance(lipid_val, str):
                try:
                    lipid_val = float(lipid_val)
                except ValueError:
                    lipid_val = 0
            
            if isinstance(carb_val, str) and carb_val.lower() in ['na', 'null', '', 'tr']:
                carb_val = 0
            elif isinstance(carb_val, str):
                try:
                    carb_val = float(carb_val)
                except ValueError:
                    carb_val = 0
            
            # Verificar se algum macronutriente está zero quando não deveria
            if protein_val == 0 and not is_valid_zero_macro(food, 'proteina'):
                problematic_foods.append({
                    'food_name': food_name,
                    'macro_type': 'proteina',
                    'macro_value': protein_val,
                    'source': source_name,
                    'details': food
                })
            
            if lipid_val == 0 and not is_valid_zero_macro(food, 'lipidio'):
                problematic_foods.append({
                    'food_name': food_name,
                    'macro_type': 'lipidio',
                    'macro_value': lipid_val,
                    'source': source_name,
                    'details': food
                })
            
            if carb_val == 0 and not is_valid_zero_macro(food, 'carboidrato'):
                problematic_foods.append({
                    'food_name': food_name,
                    'macro_type': 'carboidrato',
                    'macro_value': carb_val,
                    'source': source_name,
                    'details': food
                })
        
        except Exception as e:
            print(f"Erro ao analisar alimento: {e}")
            continue
    
    return problematic_foods

def main():
    print("Análise de alimentos com macronutrientes zerados de forma inadequada")
    print("="*70)
    
    all_problematic_foods = []
    
    # Caminhos dos arquivos de alimentos
    food_files = {
        "TACO": "C:\\Nutri 4.0\\backend\\taco.json",
        "TBCA": "C:\\Nutri 4.0\\backend\\tbca_alimentos.json", 
        "USDA": "C:\\Nutri 4.0\\backend\\usda_alimentos.json"
    }
    
    for source, file_path in food_files.items():
        if os.path.exists(file_path):
            print(f"\nAnalisando {source}...")
            try:
                food_data = load_food_data(file_path)
                problematic_foods = analyze_food_macros(food_data, source)
                
                print(f"Encontrados {len(problematic_foods)} alimentos problemáticos em {source}")
                all_problematic_foods.extend(problematic_foods)
            except Exception as e:
                print(f"Erro ao processar {file_path}: {e}")
        else:
            print(f"Arquivo não encontrado: {file_path}")
    
    # Gerar relatório
    print(f"\nRELATÓRIO FINAL:")
    print(f"Total de alimentos com macronutrientes zerados de forma inadequada: {len(all_problematic_foods)}")
    print("\nDetalhes:")
    print("-" * 70)
    
    for i, food in enumerate(all_problematic_foods, 1):
        print(f"{i:3d}. {food['food_name']}")
        print(f"     Fonte: {food['source']}")
        print(f"     Macronutriente: {food['macro_type']} = {food['macro_value']}g")
        print()
    
    # Salvar resultados em arquivo
    output_file = "alimentos_macro_zero_relatorio.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("RELATÓRIO DE ALIMENTOS COM MACRONUTRIENTES ZERADOS DE FORMA INADEQUADA\n")
        f.write("="*70 + "\n\n")
        f.write(f"Total de alimentos identificados: {len(all_problematic_foods)}\n\n")
        
        for i, food in enumerate(all_problematic_foods, 1):
            f.write(f"{i:3d}. {food['food_name']}\n")
            f.write(f"     Fonte: {food['source']}\n")
            f.write(f"     Macronutriente: {food['macro_type']} = {food['macro_value']}g\n")
            f.write("\n")
    
    print(f"\nRelatório salvo em: {output_file}")

if __name__ == "__main__":
    main()