#!/usr/bin/env python
"""
Script para verificar se as correções de duplicatas foram aplicadas corretamente
"""

import os
import django
import sys

# Configurar o ambiente Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.db.models import Q
from diets.models import FoodSubstitutionRule, NutritionistSubstitutionFavorite
from diets.views import FoodSubstitutionRuleViewSet
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory


def verify_deduplication_fixes():
    """Verifica se as correções de deduplicação foram aplicadas"""
    print("Verificando implementação das correções de deduplicação...")
    
    # 1. Verificar se o sistema de deduplicação está ativo
    print("\n1. Verificando sistema de deduplicação...")
    
    # Contar regras de substituição
    total_rules = FoodSubstitutionRule.objects.count()
    active_rules = FoodSubstitutionRule.objects.filter(is_active=True).count()
    
    print(f"   - Total de regras de substituição: {total_rules}")
    print(f"   - Regras ativas: {active_rules}")
    
    # Verificar duplicatas potenciais
    from collections import defaultdict
    rule_groups = defaultdict(list)
    
    for rule in FoodSubstitutionRule.objects.filter(is_active=True)[:50]:  # Amostra
        key = (rule.original_food_id, rule.original_source, 
               rule.diet_type, rule.nutrient_predominant)
        rule_groups[key].append(rule)
    
    potential_duplicates = {k: v for k, v in rule_groups.items() if len(v) > 1}
    print(f"   - Grupos com potenciais duplicatas: {len(potential_duplicates)}")
    
    if potential_duplicates:
        print("   - Exemplos de duplicatas potenciais:")
        for i, (key, rules) in enumerate(list(potential_duplicates.items())[:3]):
            print(f"     * Grupo {key}: {len(rules)} regras")
            for rule in rules[:2]:
                print(f"       - ID: {rule.id}, Substituto: {rule.substitute_food_name}")
    
    # 2. Verificar se a função de deduplicação está implementada
    print("\n2. Verificando implementação de deduplicação na view...")
    
    # Verificar se a view tem os mecanismos de deduplicação
    view_methods = dir(FoodSubstitutionRuleViewSet)
    dedup_methods = [m for m in view_methods if 'dedup' in m.lower() or 'unique' in m.lower()]
    print(f"   - Métodos relacionados a deduplicação encontrados: {dedup_methods}")
    
    # 3. Verificar se existem mecanismos de controle de duplicatas
    has_seen_sets = hasattr(FoodSubstitutionRuleViewSet, '_get_professional_group') or \
                   'seen_food_ids' in str(inspect.getsource(FoodSubstitutionRuleViewSet.suggest)) if hasattr(FoodSubstitutionRuleViewSet, 'suggest') else False
    
    print(f"   - Mecanismos de controle de duplicatas implementados: {has_seen_sets}")
    
    # 4. Verificar favoritas duplicadas
    print("\n3. Verificando favoritas duplicadas...")
    
    favorite_groups = defaultdict(list)
    for fav in NutritionistSubstitutionFavorite.objects.filter(is_active=True)[:50]:
        key = (fav.nutritionist_id, fav.original_food_id, fav.original_source,
               fav.substitute_food_id, fav.substitute_source, fav.diet_type)
        favorite_groups[key].append(fav)
    
    duplicate_favorites = {k: v for k, v in favorite_groups.items() if len(v) > 1}
    print(f"   - Grupos com favoritas duplicadas: {len(duplicate_favorites)}")
    
    if duplicate_favorites:
        print("   - Exemplos de favoritas duplicadas:")
        for i, (key, favs) in enumerate(list(duplicate_favorites.items())[:3]):
            print(f"     * Grupo {key}: {len(favs)} favoritas")
            for fav in favs[:2]:
                print(f"       - ID: {fav.id}, Data: {fav.created_at}")
    
    # 5. Verificar consistência de similaridade
    print("\n4. Verificando consistência de similaridade...")
    
    rules_with_low_similarity = FoodSubstitutionRule.objects.filter(
        similarity_score__lt=0.5,
        is_active=True
    ).count()
    
    print(f"   - Regras com baixa similaridade (<0.5): {rules_with_low_similarity}")
    
    # 6. Verificar grupos nutricionais consistentes
    print("\n5. Verificando consistência de grupos nutricionais...")
    
    # Este teste verificará se alimentos originais e substitutos estão no mesmo grupo
    inconsistent_groups = 0
    sample_rules = FoodSubstitutionRule.objects.filter(is_active=True)[:20]
    
    for rule in sample_rules:
        # Este teste requer a função identificar_grupo_nutricional
        try:
            from diets.nutritional_substitution import identificar_grupo_nutricional
            
            # Obter nomes dos alimentos
            original_name = rule.original_food_name
            substitute_name = rule.substitute_food_name
            
            original_group = identificar_grupo_nutricional(original_name)
            substitute_group = identificar_grupo_nutricional(substitute_name)
            
            if original_group and substitute_group and original_group != substitute_group:
                print(f"   - Inconsistência encontrada: {original_name} ({original_group}) -> {substitute_name} ({substitute_group})")
                inconsistent_groups += 1
        except ImportError:
            print("   - Função identificar_grupo_nutricional não encontrada")
            break
    
    print(f"   - Substituições com grupos nutricionais inconsistentes: {inconsistent_groups}")
    
    # 7. Verificar cálculos de equivalência
    print("\n6. Verificando cálculos de equivalência...")
    
    from diets.nutritional_substitution import calcular_substituicao, NutricaoAlimento
    
    # Testar com um exemplo conhecido
    try:
        # Exemplo de arroz integral
        arroz_original = NutricaoAlimento(
            nome="arroz, integral, cozido",
            energia_kcal=124,
            proteina_g=2.6,
            lipidios_g=0.9,
            carboidrato_g=25.8,
            fibra_g=1.8,
            grupo="Cereais",
            fonte="TACO",
        )
        
        # Exemplo de batata doce
        batata_substituta = NutricaoAlimento(
            nome="batata, doce, cozida",
            energia_kcal=77,
            proteina_g=1.4,
            lipidios_g=0.1,
            carboidrato_g=17.9,
            fibra_g=2.5,
            grupo="Tubérculos",
            fonte="TACO",
        )
        
        resultado = calcular_substituicao(arroz_original, batata_substituta, "carboidratos_complexos", 100)
        
        print(f"   - Cálculo de equivalência funcionando: {resultado is not None}")
        print(f"   - Quantidade calculada: {resultado.quantidade_substituto_g}g de {batata_substituta.nome} para equivaler 100g de {arroz_original.nome}")
        
    except Exception as e:
        print(f"   - Erro nos cálculos de equivalência: {str(e)}")
    
    print("\nVerificação concluída!")
    
    return {
        'total_rules': total_rules,
        'active_rules': active_rules,
        'potential_duplicates': len(potential_duplicates),
        'duplicate_favorites': len(duplicate_favorites),
        'low_similarity_rules': rules_with_low_similarity,
        'inconsistent_groups': inconsistent_groups
    }


def run_verification():
    """Executa a verificação completa"""
    results = verify_deduplication_fixes()
    
    print("\n" + "="*60)
    print("RESUMO DA VERIFICAÇÃO DAS CORREÇÕES")
    print("="*60)
    print(f"Total de regras de substituição: {results['total_rules']}")
    print(f"Regras ativas: {results['active_rules']}")
    print(f"Potenciais duplicatas encontradas: {results['potential_duplicates']}")
    print(f"Favoritas duplicadas: {results['duplicate_favorites']}")
    print(f"Regras com baixa similaridade: {results['low_similarity_rules']}")
    print(f"Grupos inconsistentes: {results['inconsistent_groups']}")
    print("="*60)
    
    # Avaliação da qualidade das correções
    issues_found = (
        results['potential_duplicates'] + 
        results['duplicate_favorites'] + 
        results['low_similarity_rules'] + 
        results['inconsistent_groups']
    )
    
    if issues_found == 0:
        print("[SUCCESS] CORRECOES APLICADAS COM SUCESSO - Nenhum problema significativo encontrado!")
    else:
        print(f"[WARNING] AINDA EXISTEM {issues_found} PROBLEMAS QUE PRECISAM SER ABORDADOS")
    
    return results


if __name__ == "__main__":
    import inspect
    results = run_verification()