#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script de teste para verificar a lgica de ordenao de alimentos
"""

def sort_key(x, search_query="arroz"):
    """
    Funo de ordenao que simula a lgica implementada no backend
    """
    is_favorite = x.get('is_favorite', False)
    nome_lower = x['nome'].lower()

    # Check if the name starts with the search query
    starts_with = nome_lower.startswith(search_query.lower())

    # Count words in the name
    import re
    words = re.split(r'[\s\-_,]+', nome_lower)
    word_count = len([w for w in words if w])  # Count non-empty words
    nome_length = len(nome_lower)

    # Return tuple for sorting:
    # 1. Not favorite first (so favorites come first)
    # 2. Not starts_with (so items that start with query come first)
    # 3. Word count (simpler names first)
    # 4. Name length (shorter names first)
    # 5. Alphabetical order
    return (not is_favorite, not starts_with, word_count, nome_length, nome_lower)


# Teste com exemplos de alimentos
test_foods = [
    {'nome': 'arroz de cabidela com feijao e bacon', 'is_favorite': False},
    {'nome': 'arroz integral com alho', 'is_favorite': False},
    {'nome': 'arroz carreteiro', 'is_favorite': False},
    {'nome': 'arroz', 'is_favorite': False},
    {'nome': 'feijoada completa com arroz, couve e laranja', 'is_favorite': False},
    {'nome': 'feijoada', 'is_favorite': False},
    {'nome': 'bife acebolado com arroz e batata frita', 'is_favorite': False},
    {'nome': 'bife', 'is_favorite': False},
    {'nome': 'salada mista', 'is_favorite': False},
    {'nome': 'salada', 'is_favorite': False},
    {'nome': 'carré', 'is_favorite': False},
    {'nome': 'arrozina', 'is_favorite': False},
    {'nome': 'barreado', 'is_favorite': False},
    {'nome': 'macarrao', 'is_favorite': False},
    {'nome': 'chimarrão', 'is_favorite': False},
    {'nome': 'arroz branco', 'is_favorite': True},  # favorito
]

print("Antes da ordenao:")
for i, food in enumerate(test_foods, 1):
    fav_status = " (Favorito)" if food['is_favorite'] else ""
    print(f"{i}. {food['nome']}{fav_status}")

# Aplicar ordenao
search_query = "arroz"  # Simulando a busca por "arroz"
test_foods.sort(key=lambda x: sort_key(x, search_query))

print(f"\nAps a ordenao (buscando por '{search_query}', com favoritos primeiro, depois por relevância e simplicidade):")
for i, food in enumerate(test_foods, 1):
    fav_status = " (Favorito)" if food['is_favorite'] else ""
    starts_with_query = " (começa com)" if food['nome'].lower().startswith(search_query.lower()) else " (contém)"
    print(f"{i}. {food['nome']}{fav_status}{starts_with_query}")

print("\nTeste concluido com sucesso!")