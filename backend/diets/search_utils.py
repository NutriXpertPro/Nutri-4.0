"""
Módulo de utilitários para busca avançada de alimentos.
Ranking Clínico Nutri 4.0 - Prioridade Total para Alimentos In Natura e Grelhados.
"""

import re
from django.db.models import Q
from unidecode import unidecode


def normalizar_para_scoring(texto: str) -> list:
    """
    Normaliza o texto de busca, removendo acentos e separando em palavras.
    Ignora palavras de ligação para ampliar os resultados encontrados.
    """
    if not texto:
        return []
    
    texto_normalizado = unidecode(texto.lower())
    tokens = re.split(r'[,\s]+', texto_normalizado)
    
    stop_words = {'de', 'da', 'do', 'com', 'ao', 'na', 'no', 'para', 'em', 'a', 'o'}
    clean_tokens = [token.strip() for token in tokens if token.strip() and len(token.strip()) >= 2]
    
    if len(clean_tokens) > 1:
        clean_tokens = [t for t in clean_tokens if t not in stop_words]
    
    return clean_tokens


def calcular_score_radical(item_nome: str, q_tokens: list) -> float:
    """
    Motor de Scoring Nutri 4.0 - Versão "Dignidade Nutricional"
    Garante que alimentos simples e saudáveis vençam pratos complexos e frituras.
    """
    if not q_tokens or not item_nome:
        return -1000.0
    
    item_nome_lower = unidecode(item_nome.lower())
    score = 0.0
    
    # 1. BÔNUS DE POSIÇÃO (A palavra no início vale OURO)
    # Quanto mais cedo as palavras da busca aparecem, maior o bônus.
    for token in q_tokens:
        if token in item_nome_lower:
            pos = item_nome_lower.find(token)
            if pos == 0:
                score += 100.0  # Começa com a palavra buscada!
            elif pos < 15:
                score += 50.0   # Está bem no início
            else:
                score += 10.0   # Está no meio ou fim (descrição longa)

    # 2. MATCH DE PALAVRA EXATA (Evita bônus parcial como 'frangos' para 'frango')
    item_palavras = item_nome_lower.split()
    for token in q_tokens:
        if token in item_palavras:
            score += 40.0

    # 3. BÔNUS DE COERÊNCIA (Todos os termos encontrados juntos)
    tokens_encontrados = sum(1 for token in q_tokens if token in item_nome_lower)
    if tokens_encontrados == len(q_tokens):
        score += 150.0  # Bônus massivo para quem tem todas as palavras
        
    # 4. PENALIDADES CRÍTICAS (A "Lista Negra" de preparações não recomendadas)
    # Se o nutricionista busca "filé", ele NÃO quer "parmegiana" ou "milanesa".
    preparacoes_ruins = {
        'parmegiana': 700.0,
        'milanesa': 650.0,
        'empanado': 600.0,
        'frito': 600.0,
        'frita': 600.0,
        'fritura': 600.0,
        'congelado': 400.0,
        'congelada': 400.0,
        'nuggets': 500.0,
        'maionese': 300.0,
        'industrializado': 300.0,
        'chips': 400.0,
        'snack': 300.0,
        'ultraprocessado': 500.0,
        'embutido': 400.0,
        'cru': 200.0,
        'crua': 200.0,
    }
    
    for termo, penalidade in preparacoes_ruins.items():
        if termo in item_nome_lower and termo not in q_tokens:
            score -= penalidade

    # 5. BLOQUEIO DE PRATOS COMPOSTOS E COMIDA RÁPIDA
    pratos_compostos = {
        'salada', 'pizza', 'sanduiche', 'hamburguer', 'sopa', 'lasanha', 
        'quiche', 'torta', 'pastel', 'salgadinho', 'bolinho', 'recheado',
        'recheada', 'doce', 'sorvete', 'bolo'
    }
    for prato in pratos_compostos:
        if prato in item_nome_lower and prato not in q_tokens:
            score -= 800.0 # Bônus de exclusão massivo para pratos prontos

    # 6. BÔNUS DE PREPARO SAUDÁVEL E NATURALIDADE
    preparos_bons = {
        'grelhado': 80.0,
        'cozido': 70.0,
        'assado': 60.0,
        'vapor': 75.0,
        'grelhada': 80.0,
        'cozida': 70.0,
        'assada': 60.0,
        'natural': 100.0,
        'fresco': 50.0,
        'fresca': 50.0,
        'integral': 40.0,
    }
    for preparo, bonus in preparos_bons.items():
        if preparo in item_nome_lower:
            score += bonus

    # 7. BÔNUS PARA ALIMENTOS "LIMPOS" (Quanto menos palavras, geralmente é mais básico/natural)
    # Ex: "Arroz integral" vs "Arroz integral com vegetais e molho especial"
    if len(item_palavras) <= 3:
        score += 50.0
    
    # 8. LEI DA BREVIDADE EXTREMA
    # Penaliza descrições gigantescas que geralmente indicam produtos ultraprocessados.
    num_palavras = len(item_palavras)
    score -= (num_palavras * 15.0)
    score -= (len(item_nome_lower) / 2.0)
    
    return score


def apply_search_filter(queryset, query: str, field: str = "nome"):
    """
    Filtro que garante que os termos principais estejam no nome.
    Ignora palavras curtas/conectivos.
    """
    if not query:
        return queryset

    tokens = normalizar_para_scoring(query)
    if not tokens:
        return queryset

    # Usamos Q objects para garantir que TODOS os tokens (AND) estejam presentes
    # mas removemos o rigor de conectivos no normalizar_para_scoring
    q_objects = Q()
    for token in tokens:
        q_objects &= Q(**{f"{field}__icontains": token})

    return queryset.filter(q_objects)


def calcular_score_busca_avancada(item_nome: str, query: str) -> float:
    return calcular_score_radical(item_nome, normalizar_para_scoring(query))