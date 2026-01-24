
import sys
import os

# Adicionar o diretório do backend/diets ao path
sys.path.append(os.path.join(os.getcwd(), "backend", "diets"))

from nutritional_substitution import (
    NutricaoAlimento,
    calcular_substituicao,
    identificar_grupo_nutricional
)

def test_substitution(name1, kcal1, pro1, carb1, fat1, name2, kcal2, pro2, carb2, fat2, qty1=100):
    a1 = NutricaoAlimento(nome=name1, energia_kcal=kcal1, proteina_g=pro1, carboidrato_g=carb1, lipidios_g=fat1)
    a2 = NutricaoAlimento(nome=name2, energia_kcal=kcal2, proteina_g=pro2, carboidrato_g=carb2, lipidios_g=fat2)
    
    grupo = identificar_grupo_nutricional(name1)
    print(f"\nSubstituindo {name1} por {name2}")
    print(f"Grupo identificado: {grupo}")
    
    if not grupo:
        print("Erro: Grupo não identificado")
        # Forçar grupo para continuar teste se houver erro de identificação por nome
        if "arroz" in name1 or "carb" in name1: grupo = "carboidratos_complexos"
        elif "feijão" in name1: grupo = "leguminosas"
        else: return

    res = calcular_substituicao(a1, a2, grupo, qty1)
    print(f"Resultado: {res.quantidade_substituto_g}g de {name2}")
    print(f"Macro equalizado: {res.macronutriente_igualizado}")
    print(f"Calorias Original: {res.calorias_original} | Substituto: {res.calorias_substituto}")
    
    # Verificar se as proporções batem
    if res.macronutriente_igualizado == "carboidrato":
        carb_orig = (carb1 * qty1) / 100
        carb_sub = (carb2 * res.quantidade_substituto_g) / 100
        print(f"Carbos: Original={carb_orig:.2f}g | Substituto={carb_sub:.2f}g")
        if abs(carb_orig - carb_sub) > 0.5:
            print(">>> ERRO: Carbos não estão proporcionais!")
    elif res.macronutriente_igualizado == "proteína":
        pro_orig = (pro1 * qty1) / 100
        pro_sub = (pro2 * res.quantidade_substituto_g) / 100
        print(f"Proteína: Original={pro_orig:.2f}g | Substituto={pro_sub:.2f}g")
        if abs(pro_orig - pro_sub) > 0.5:
            print(">>> ERRO: Proteínas não estão proporcionais!")

# Teste 1: Arroz (CARB) -> Batata Doce
# Arroz: 25.8g carb, 124 kcal
# Batata Doce: 17.9g carb, 77 kcal
test_substitution(
    "arroz, branco, cozido", 128, 2.5, 28.1, 0.2, 
    "batata, doce, cozida", 77, 1.4, 17.9, 0.1
)

# Teste 2: Feijão (LEGUME)
# Feijão: 14g carb, 91 kcal
# Lentilha: 15g carb, 110 kcal
test_substitution(
    "feijão, preto, cozido", 91, 6.0, 14.0, 0.5,
    "lentilha, cozida", 110, 9.0, 15.0, 0.5
)

# Teste 3: Caso onde a diferença calórica é > 30 kcal
# Alimento original com 400 kcal e 80g carb
# Alimento substituto com 100 kcal e 80g carb
# O esperado é 100g -> 100g para manter o carb
# Mas se as calorias limitarem, vai aumentar a quantidade.
test_substitution(
    "alimento_hiper_carb", 400, 10, 80, 5,
    "arroz, branco, cozido", 128, 2.5, 28.1, 0.2
)
