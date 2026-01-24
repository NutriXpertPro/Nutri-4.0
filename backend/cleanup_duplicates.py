#!/usr/bin/env python
"""
Script para limpeza de duplicatas reais no banco de dados de substituições
"""

import os
import django
import sys

# Configurar o ambiente Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.db import transaction
from diets.models import FoodSubstitutionRule, NutritionistSubstitutionFavorite
from collections import defaultdict


def cleanup_duplicate_rules():
    """Remove regras de substituição duplicadas no banco de dados"""
    print("Iniciando limpeza de regras de substituição duplicadas...")
    
    # Encontrar duplicatas reais
    all_rules = FoodSubstitutionRule.objects.all()
    duplicates_found = 0
    rules_to_delete = []
    
    # Agrupar regras por critérios de duplicação
    rule_groups = defaultdict(list)
    for rule in all_rules:
        # Chave de agrupamento: original + substituto + tipo de dieta
        key = (rule.original_source, rule.original_food_id, 
               rule.substitute_source, rule.substitute_food_id, 
               rule.diet_type)
        rule_groups[key].append(rule)
    
    # Para cada grupo com mais de uma regra, manter a mais recente e marcar as outras para exclusão
    for key, rules in rule_groups.items():
        if len(rules) > 1:
            # Ordenar por data de criação (ou ID) e manter a mais recente
            sorted_rules = sorted(rules, key=lambda r: (r.created_at, r.id), reverse=True)
            rules_to_keep = [sorted_rules[0]]  # Manter a mais recente
            rules_to_delete.extend(sorted_rules[1:])  # Excluir as outras
            
            print(f"Duplicatas encontradas para {key}: {len(rules)} regras")
            duplicates_found += len(rules) - 1
    
    # Excluir duplicatas
    deleted_count = 0
    for rule in rules_to_delete:
        try:
            rule.delete()
            deleted_count += 1
        except Exception as e:
            print(f"Erro ao excluir regra {rule.id}: {str(e)}")
    
    print(f"Limpeza concluída: {deleted_count} regras duplicadas removidas de {duplicates_found} grupos de duplicatas identificados")
    return deleted_count


def cleanup_duplicate_favorites():
    """Remove favoritas de substituição duplicadas no banco de dados"""
    print("\nIniciando limpeza de favoritas de substituição duplicadas...")
    
    all_favorites = NutritionistSubstitutionFavorite.objects.all()
    duplicates_found = 0
    favorites_to_delete = []
    
    # Agrupar favoritas por critérios de duplicação
    favorite_groups = defaultdict(list)
    for fav in all_favorites:
        # Chave de agrupamento: nutricionista + original + substituto + tipo de dieta
        key = (fav.nutritionist_id, fav.original_source, fav.original_food_id,
               fav.substitute_source, fav.substitute_food_id, fav.diet_type)
        favorite_groups[key].append(fav)
    
    # Para cada grupo com mais de uma favorita, manter a mais recente
    for key, favorites in favorite_groups.items():
        if len(favorites) > 1:
            sorted_favorites = sorted(favorites, key=lambda f: (f.created_at, f.id), reverse=True)
            favorites_to_keep = [sorted_favorites[0]]
            favorites_to_delete.extend(sorted_favorites[1:])
            
            print(f"Duplicatas encontradas para favoritas {key}: {len(favorites)} registros")
            duplicates_found += len(favorites) - 1
    
    # Excluir duplicatas
    deleted_count = 0
    for fav in favorites_to_delete:
        try:
            fav.delete()
            deleted_count += 1
        except Exception as e:
            print(f"Erro ao excluir favorita {fav.id}: {str(e)}")
    
    print(f"Limpeza de favoritas concluída: {deleted_count} registros duplicados removidos")
    return deleted_count


def run_cleanup():
    """Executa a limpeza completa de duplicatas"""
    print("Iniciando processo de limpeza de duplicatas...")
    
    total_deleted = 0
    total_deleted += cleanup_duplicate_rules()
    total_deleted += cleanup_duplicate_favorites()
    
    print(f"\nLimpeza completa! Total de {total_deleted} registros duplicados removidos.")
    print("O sistema agora deve ter menos duplicatas funcionais.")


if __name__ == "__main__":
    run_cleanup()