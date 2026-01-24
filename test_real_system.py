#!/usr/bin/env python
# Script para testar o comportamento real do sistema

import os
import sys
import django

# Configurar o ambiente Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from backend.diets.views import FoodSearchViewSet
from backend.diets.models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA

def test_real_search():
    """Testar a busca real no sistema"""
    print("Testando busca real no sistema...")
    
    # Criar uma instância do viewset
    viewset = FoodSearchViewSet()
    
    # Testar a função de normalização
    def test_normalize():
        print("\n--- Testando normalização ---")
        test_texts = [
            "file de frango",
            "croissant assado com recheio de peito de frango",
            "peito de frango grelhado"
        ]
        
        for text in test_texts:
            # Simular a função normalizar_para_scoring
            import unicodedata
            import re
            
            def normalizar_para_scoring(texto):
                if not texto: return []
                
                # 1. Remover acentos e converter para minúsculas
                texto = "".join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()

                # 2. Remover pontuação e caracteres especiais, mantendo apenas letras e espaços
                texto = re.sub(r'[^\w\s]', ' ', texto)

                # 3. Remover espaços extras
                texto = ' '.join(texto.split())

                # 4. Remover stopwords comuns
                stopwords = {"de", "com", "sem", "para", "preparado", "na", "no", "ao", "a", "o", "à", "e", "do", "da", "dos", "das", "em", "um", "uma", "uns", "umas"}
                tokens = [t.strip() for t in texto.split() if t.strip() and t.strip() not in stopwords]

                # 5. Unificação de variações comuns
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
                    "pao": "pão",
                    "macarrao": "macarrão",
                    "acucar": "açúcar",
                    "oleo": "óleo",
                    "azeite": "azeite"
                }
                return [mapa.get(t, t) for t in tokens]
            
            normalized = normalizar_para_scoring(text)
            print(f"'{text}' -> {normalized}")
    
    test_normalize()
    
    # Testar a função de cálculo de score
    def test_scoring():
        print("\n--- Testando pontuação ---")
        
        # Simular os tokens da busca
        q_tokens = ["file", "frango"]  # Normalizado de "file de frango"
        
        # Testar diferentes alimentos
        test_items = [
            {"nome": "File de frango grelhado"},
            {"nome": "Croissant assado com recheio de peito de frango"},
            {"nome": "Peito de frango grelhado"},
            {"nome": "Frango, peito, file, grelhado"}
        ]
        
        for item in test_items:
            nome_original = item["nome"]
            
            # Simular a função normalizar_para_scoring
            import unicodedata
            import re
            
            def normalizar_para_scoring(texto):
                if not texto: return []
                
                # 1. Remover acentos e converter para minúsculas
                texto = "".join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()

                # 2. Remover pontuação e caracteres especiais, mantendo apenas letras e espaços
                texto = re.sub(r'[^\w\s]', ' ', texto)

                # 3. Remover espaços extras
                texto = ' '.join(texto.split())

                # 4. Remover stopwords comuns
                stopwords = {"de", "com", "sem", "para", "preparado", "na", "no", "ao", "a", "o", "à", "e", "do", "da", "dos", "das", "em", "um", "uma", "uns", "umas"}
                tokens = [t.strip() for t in texto.split() if t.strip() and t.strip() not in stopwords]

                # 5. Unificação de variações comuns
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
                    "pao": "pão",
                    "macarrao": "macarrão",
                    "acucar": "açúcar",
                    "oleo": "óleo",
                    "azeite": "azeite"
                }
                return [mapa.get(t, t) for t in tokens]
            
            n_tokens = normalizar_para_scoring(nome_original)
            
            # Calcular score manualmente com a nova fórmula
            score = 0
            palavras_encontradas = 0

            # Contar quantas palavras da consulta aparecem como palavras COMPLETAS no nome do alimento
            for qt in q_tokens:
                for nt in n_tokens:
                    # Comparar apenas palavras completas (qt == nt), não substrings
                    if qt == nt:
                        palavras_encontradas += 1
                        break

            # Base score baseado na quantidade de palavras encontradas
            score = palavras_encontradas * 1000  # Multiplicador alto
            
            # Penalidade quadrática drástica por número de palavras - quanto mais palavras, menos pontos
            score = score - (len(n_tokens) * len(n_tokens) * 100)  # Penalidade quadrática MUITO alta
            
            # Bônus MASSIVO se todas as palavras da consulta forem encontradas
            if palavras_encontradas > 0 and palavras_encontradas == len(q_tokens):
                score += 10000  # Bônus MASSIVO para correspondência completa

            # Penalidade extrema para nomes irrelevantes
            if palavras_encontradas == 0:
                score = -10000
            
            print(f"'{nome_original}' -> Tokens: {n_tokens}, Encontradas: {palavras_encontradas}/{len(q_tokens)}, Score: {score}")
    
    test_scoring()

if __name__ == "__main__":
    test_real_search()