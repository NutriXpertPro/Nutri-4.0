"""
Script para corrigir as regras de substituição de alimentos.
Remove regras com classificação incorreta e garante que as substituições
sejam nutricionalmente equivalentes.
"""

import os
import django
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "."))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from diets.models import FoodSubstitutionRule, AlimentoTACO, AlimentoTBCA
from diets.views import FoodSubstitutionRuleViewSet

# Criar uma instância do ViewSet para acessar os métodos auxiliares
viewset = FoodSubstitutionRuleViewSet()


def get_professional_group(food):
    """Classifica o alimento em um grupo profissional"""
    return viewset._get_professional_group(food)


def identify_predominant_nutrient(food):
    """Identifica o macronutriente predominante do alimento"""
    return viewset._identify_predominant_nutrient(food)


# Alimentos que NÃO devem ser substitutos de carboidratos/leguminosas
EXCLUDED_GROUPS = ["VEGGIE", "OTHER"]
# Palavras que indicam alimentos ultraprocessados ou inadequados
EXCLUDED_KEYWORDS = [
    "bolo",
    "biscoito",
    "farinha",
    "torrada",
    "industrializ",
    "pronto",
    "congelado",
    "sorvete",
    "gelatina",
    "refrigerante",
    "refresco",
]


def validate_rule(rule):
    """Valida se uma regra de substituição é adequada"""
    try:
        # Buscar o alimento substituto
        if rule.substitute_source == "TACO":
            subst_food = AlimentoTACO.objects.get(id=rule.substitute_food_id)
        elif rule.substitute_source == "TBCA":
            subst_food = AlimentoTBCA.objects.get(id=rule.substitute_food_id)
        else:
            return False, "Fonte não suportada"

        # Verificar se o nome contém palavras excluídas
        sub_name_low = subst_food.nome.lower()
        if any(kw in sub_name_low for kw in EXCLUDED_KEYWORDS):
            return False, "Contém palavra excluída"

        # Obter o grupo profissional do substituto
        sub_group = get_professional_group(subst_food)

        # Para carboidratos, substituto deve ser CARB ou LEGUME (mas não VEGGIE)
        if rule.nutrient_predominant == "carb":
            if sub_group in EXCLUDED_GROUPS:
                return False, f"Grupo {sub_group} não adequado para carboidrato"

        # Para proteínas, substituto deve ser PROTEIN_LEAN
        if rule.nutrient_predominant == "protein":
            if sub_group != "PROTEIN_LEAN":
                return False, f"Grupo {sub_group} não adequado para proteína"

        return True, "Regra válida"

    except Exception as e:
        return False, f"Erro: {str(e)}"


# 1. Contar regras atuais
total_rules = FoodSubstitutionRule.objects.filter(is_active=True).count()
print(f"Total de regras ativas: {total_rules}")

# 2. Validar regras normocalóricas de carboidrato
rules = FoodSubstitutionRule.objects.filter(
    diet_type="normocalorica", nutrient_predominant="carb", is_active=True
)
print(f"\nValidando {rules.count()} regras de carboidrato/normocalórica...")

invalid_count = 0
invalid_rules = []

for rule in rules:
    is_valid, reason = validate_rule(rule)
    if not is_valid:
        invalid_count += 1
        invalid_rules.append(
            {"id": rule.id, "food": rule.substitute_food_name, "reason": reason}
        )

print(f"\nRegras inválidas encontradas: {invalid_count}")
for inv in invalid_rules[:20]:
    print(f"  ID {inv['id']}: {inv['food']} - {inv['reason']}")
if len(invalid_rules) > 20:
    print(f"  ... e mais {len(invalid_rules) - 20} regras inválidas")

# 3. Perguntar se deseja remover as regras inválidas
if invalid_count > 0:
    print("\n" + "=" * 60)
    response = input(f"Deseja remover as {invalid_count} regras inválidas? (s/n): ")
    if response.lower() == "s":
        for inv in invalid_rules:
            FoodSubstitutionRule.objects.filter(id=inv["id"]).delete()
        print(f"\n✓ {invalid_count} regras inválidas removidas com sucesso!")

# 4. Criar regras corretas para alimentos comuns
print("\n" + "=" * 60)
print("CRIANDO REGRAS CORRETAS")
print("=" * 60)

# Pares de substituição adequados para carboidratos
carb_substitutions = [
    # (orig_source, orig_id, orig_name, sub_source, sub_id, sub_name, diet_type)
    (
        "TACO",
        10,
        "Arroz, tipo 1, cozido",
        "TACO",
        16,
        "Arroz, integral, cozido",
        "normocalorica",
    ),
    (
        "TACO",
        10,
        "Arroz, tipo 1, cozido",
        "TACO",
        119,
        "Batata, doce, cozida",
        "normocalorica",
    ),
    (
        "TACO",
        10,
        "Arroz, tipo 1, cozido",
        "TACO",
        122,
        "Batata, inglesa, cozida",
        "normocalorica",
    ),
    (
        "TACO",
        10,
        "Arroz, tipo 1, cozido",
        "TACO",
        196,
        "Macarrão, trigo, cozido",
        "normocalorica",
    ),
    (
        "TACO",
        16,
        "Arroz, integral, cozido",
        "TACO",
        119,
        "Batata, doce, cozida",
        "normocalorica",
    ),
    (
        "TACO",
        16,
        "Arroz, integral, cozido",
        "TACO",
        122,
        "Batata, inglesa, cozida",
        "normocalorica",
    ),
    (
        "TACO",
        122,
        "Batata, inglesa, cozida",
        "TACO",
        119,
        "Batata, doce, cozida",
        "normocalorica",
    ),
    (
        "TACO",
        122,
        "Batata, inglesa, cozida",
        "TACO",
        154,
        "Mandioca, cozida",
        "normocalorica",
    ),
    (
        "TACO",
        196,
        "Macarrão, trigo, cozido",
        "TACO",
        10,
        "Arroz, tipo 1, cozido",
        "normocalorica",
    ),
    (
        "TACO",
        196,
        "Macarrão, trigo, cozido",
        "TACO",
        16,
        "Arroz, integral, cozido",
        "normocalorica",
    ),
]

created_count = 0
for (
    orig_source,
    orig_id,
    orig_name,
    sub_source,
    sub_id,
    sub_name,
    diet_type,
) in carb_substitutions:
    try:
        # Buscar alimentos
        if orig_source == "TACO":
            orig_food = AlimentoTACO.objects.get(id=orig_id)
            sub_food = AlimentoTACO.objects.get(id=sub_id)
        else:
            continue

        # Calcular similaridade (simplificado)
        pred = identify_predominant_nutrient(orig_food)
        sub_pred = identify_predominant_nutrient(sub_food)

        if pred != sub_pred:
            continue

        # Similaridade baseada em densidade de calorias
        orig_kcal_per_100g = orig_food.energia_kcal
        sub_kcal_per_100g = sub_food.energia_kcal
        kcal_diff_pct = abs(orig_kcal_per_100g - sub_kcal_per_100g) / orig_kcal_per_100g
        similarity = max(0.6, min(0.95, 1.0 - kcal_diff_pct))

        # Verificar se a regra já existe
        existing = FoodSubstitutionRule.objects.filter(
            original_source=orig_source,
            original_food_id=str(orig_id),
            substitute_source=sub_source,
            substitute_food_id=str(sub_id),
            diet_type=diet_type,
        ).first()

        if existing:
            # Atualizar se necessário
            existing.similarity_score = similarity
            existing.nutrient_predominant = pred
            existing.save()
            print(f"✓ Atualizada: {orig_name} → {sub_name}")
        else:
            # Criar nova regra
            FoodSubstitutionRule.objects.create(
                original_source=orig_source,
                original_food_id=str(orig_id),
                original_food_name=orig_name,
                substitute_source=sub_source,
                substitute_food_id=str(sub_id),
                substitute_food_name=sub_name,
                diet_type=diet_type,
                nutrient_predominant=pred,
                similarity_score=similarity,
                conversion_factor=1.0,
                suggested_quantity=100.0,
                priority=50,
                is_active=True,
                notes="Substituição validada entre alimentos equivalentes",
            )
            created_count += 1
            print(f"✓ Criada: {orig_name} → {sub_name}")

    except Exception as e:
        print(f"✗ Erro ao criar regra {orig_name} → {sub_name}: {e}")

print(f"\nTotal de novas regras criadas: {created_count}")
print("Script concluído!")
