#!/usr/bin/env python
# Debug script to understand the search scoring

import unicodedata
import re

def normalizar_para_scoring(texto):
    """Normalize text for scoring - same as in the backend"""
    if not texto: return []
    
    # 1. Remove accents and convert to lowercase
    texto = "".join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()

    # 2. Remove punctuation and special characters, keeping only letters and spaces
    texto = re.sub(r'[^\w\s]', ' ', texto)

    # 3. Remove extra spaces
    texto = ' '.join(texto.split())

    # 4. Remove common stopwords
    stopwords = {"de", "com", "sem", "para", "preparado", "na", "no", "ao", "a", "o", "à", "e", "do", "da", "dos", "das", "em", "um", "uma", "uns", "umas"}
    tokens = [t.strip() for t in texto.split() if t.strip() and t.strip() not in stopwords]

    # 5. Normalize common variations
    mapa = {
        "filet": "file",
        "filé": "file",
        "peito": "file",
        "coxao": "coxa",
        "coxão": "coxa",
        "almoco": "almoço",
        "sobremesa": "sobremesa",
        "batata": "batata",
        "arroz": "arroz",
        "feijao": "feijão",
        "frango": "frango",
        "carne": "carne",
        "bife": "bife",
        "ovo": "ovo",
        "leite": "leite",
        "queijo": "queijo",
        "iogurte": "iogurte",
        "pao": "pão",
        "macarrao": "macarrão",
        "acucar": "açúcar",
        "oleo": "óleo",
        "azeite": "azeite"
    }
    return [mapa.get(t, t) for t in tokens]

def calcular_score_debug(nome_original, search_query):
    """Debug version of score calculation"""
    
    print(f"Busca: '{search_query}'")
    print(f"Alimento: '{nome_original}'")
    
    # Normalize both the food name and search query
    n_tokens = normalizar_para_scoring(nome_original)
    q_tokens = normalizar_para_scoring(search_query)
    
    print(f"Tokens da busca: {q_tokens}")
    print(f"Tokens do alimento: {n_tokens}")
    
    score = 0
    palavras_encontradas = 0

    # Contar quantas palavras da consulta aparecem como palavras COMPLETAS no nome do alimento
    for qt in q_tokens:
        found = False
        for nt in n_tokens:
            # Comparar apenas palavras completas (qt == nt), não substrings
            if qt == nt:
                palavras_encontradas += 1
                print(f"  Palavra encontrada: '{qt}' == '{nt}'")
                found = True
                break
        if not found:
            print(f"  Palavra NÃO encontrada: '{qt}'")

    print(f"Palavras encontradas: {palavras_encontradas}/{len(q_tokens)}")

    # Base score baseado na quantidade de palavras encontradas
    score = palavras_encontradas * 1000  # Multiplicador alto
    print(f"Score base (palavras encontradas * 1000): {score}")
    
    # Penalidade quadrática drástica por número de palavras - quanto mais palavras, menos pontos
    penalidade_palavras = len(n_tokens) * len(n_tokens) * 100
    score = score - penalidade_palavras  # Penalidade quadrática MUITO alta por palavra
    print(f"Penalidade quadrática por número de palavras ({len(n_tokens)}² * 100): -{penalidade_palavras}")
    print(f"Score após penalidade: {score}")
    
    # Bônus MASSIVO se todas as palavras da consulta forem encontradas
    if palavras_encontradas > 0 and palavras_encontradas == len(q_tokens):
        score += 10000  # Bônus MASSIVO para correspondência completa
        print(f"Bônus por correspondência completa: +10000")
        print(f"Score final: {score}")
    elif palavras_encontradas == 0:
        score = -10000
        print(f"Penalidade extrema para nomes irrelevantes: -10000")
        print(f"Score final: {score}")
    else:
        print(f"Score final: {score}")

    return score

def debug_search():
    """Debug specific search examples"""
    
    print("=== DEBUG: file de frango ===")
    
    # Test with problematic food
    calcular_score_debug("Croissant assado com recheio de peito de frango", "file de frango")
    print()
    
    # Test with good food
    calcular_score_debug("File de frango grelhado", "file de frango")
    print()
    
    # Test with medium food
    calcular_score_debug("Frango, peito, file, grelhado", "file de frango")
    print()

if __name__ == "__main__":
    debug_search()