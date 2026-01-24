#!/usr/bin/env python
"""
Script para verificar a qualidade nutricional das substituições
"""

import os
import django
import sys

# Configurar o ambiente Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.db.models import Q
from diets.models import FoodSubstitutionRule
from diets.nutritional_substitution import NutricaoAlimento, calcular_substituicao


def verify_substitution_quality():
    """Verifica a qualidade nutricional das substituições"""
    print("Iniciando verificação de qualidade nutricional das substituições...")
    
    # Obter regras de substituição ativas
    rules = FoodSubstitutionRule.objects.filter(is_active=True)[:100]  # Limitar para teste
    
    issues_found = 0
    total_checked = 0
    
    for rule in rules:
        total_checked += 1
        
        # Obter dados dos alimentos
        original_food = get_food_data(rule.original_source, rule.original_food_id)
        substitute_food = get_food_data(rule.substitute_source, rule.substitute_food_id)
        
        if original_food and substitute_food:
            try:
                # Calcular substituição
                result = calcular_substituicao(
                    original_food, substitute_food, rule.nutrient_predominant, 100
                )
                
                # Verificar qualidade da substituição
                quality_issues = check_substitution_quality(original_food, substitute_food, result)
                
                if quality_issues:
                    print(f"ISSUE na regra {rule.id}:")
                    print(f"  Original: {original_food.nome} -> Substituto: {substitute_food.nome}")
                    for issue in quality_issues:
                        print(f"  - {issue}")
                    issues_found += 1
                    
            except Exception as e:
                print(f"ERRO ao calcular substituição para regra {rule.id}: {str(e)}")
    
    print(f"\nVerificação concluída:")
    print(f"- Total de regras verificadas: {total_checked}")
    print(f"- Issues encontradas: {issues_found}")
    print(f"- Taxa de problemas: {issues_found/total_checked*100:.2f}% se houver regras" if total_checked > 0 else "Nenhuma regra verificada")


def get_food_data(source, food_id):
    """Obtém dados nutricionais de um alimento"""
    from diets.models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA
    
    try:
        if source == 'TACO':
            food = AlimentoTACO.objects.get(id=food_id)
            return NutricaoAlimento(
                nome=food.nome,
                energia_kcal=food.energia_kcal,
                proteina_g=food.proteina_g,
                lipidios_g=food.lipidios_g,
                carboidrato_g=food.carboidrato_g,
                fibra_g=getattr(food, 'fibra_g', 0),
                grupo=food.grupo,
                fonte='TACO'
            )
        elif source == 'TBCA':
            food = AlimentoTBCA.objects.get(id=food_id)
            return NutricaoAlimento(
                nome=food.nome,
                energia_kcal=food.energia_kcal,
                proteina_g=food.proteina_g,
                lipidios_g=food.lipidios_g,
                carboidrato_g=food.carboidrato_g,
                fibra_g=getattr(food, 'fibra_g', 0),
                grupo=food.grupo,
                fonte='TBCA'
            )
        elif source == 'USDA':
            food = AlimentoUSDA.objects.get(fdc_id=food_id)
            return NutricaoAlimento(
                nome=food.nome,
                energia_kcal=food.energia_kcal,
                proteina_g=food.proteina_g,
                lipidios_g=food.lipidios_g,
                carboidrato_g=food.carboidrato_g,
                fibra_g=getattr(food, 'fibra_g', 0),
                grupo=food.categoria,
                fonte='USDA'
            )
    except Exception as e:
        print(f"Erro ao obter dados do alimento {source}:{food_id} - {str(e)}")
        return None


def check_substitution_quality(original_food, substitute_food, result):
    """Verifica a qualidade da substituição calculada"""
    issues = []
    
    # Verificar se os alimentos são do mesmo grupo nutricional
    original_group = result.alimento_original.grupo.lower() if hasattr(result, 'alimento_original') else original_food.grupo.lower()
    substitute_group = result.alimento_substituto.grupo.lower() if hasattr(result, 'alimento_substituto') else substitute_food.grupo.lower()
    
    if original_group != substitute_group:
        issues.append(f"Grupos nutricionais diferentes: {original_group} vs {substitute_group}")
    
    # Verificar diferença calórica extrema
    if hasattr(result, 'diferenca_calorica'):
        if abs(result.diferenca_calorica) > 100:  # Mais de 100kcal de diferença
            issues.append(f"Diferença calórica extrema: {result.diferenca_calorica} kcal")
    
    # Verificar similaridade de macronutrientes predominantes
    nutrient_predominant = getattr(result, 'macronutriente_igualizado', 'calorias')
    
    if nutrient_predominant == 'carboidrato':
        carb_diff = abs(original_food.carboidrato_g - substitute_food.carboidrato_g)
        if carb_diff > 10:  # Mais de 10g de diferença
            issues.append(f"Diferença significativa em carboidratos: {carb_diff}g")
    elif nutrient_predominant == 'proteína':
        prot_diff = abs(original_food.proteina_g - substitute_food.proteina_g)
        if prot_diff > 10:  # Mais de 10g de diferença
            issues.append(f"Diferença significativa em proteínas: {prot_diff}g")
    elif nutrient_predominant == 'gordura':
        fat_diff = abs(original_food.lipidios_g - substitute_food.lipidios_g)
        if fat_diff > 10:  # Mais de 10g de diferença
            issues.append(f"Diferença significativa em gorduras: {fat_diff}g")
    
    # Verificar se a quantidade calculada é razoável
    if hasattr(result, 'quantidade_substituto_g'):
        if result.quantidade_substituto_g < 10 or result.quantidade_substituto_g > 500:
            issues.append(f"Quantidade calculada não razoável: {result.quantidade_substituto_g}g")
    
    return issues


def run_quality_verification():
    """Executa a verificação de qualidade"""
    verify_substitution_quality()


if __name__ == "__main__":
    run_quality_verification()