#!/usr/bin/env python3
"""
Script para extrair dados nutricionais específicos do PDF liv50000.pdf
"""

import PyPDF2
import os
import re

def extract_specific_nutritional_data(pdf_path):
    """Extrai dados nutricionais específicos do PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            print(f"Número total de páginas: {num_pages}")
            
            # Procurar por dados nutricionais específicos
            nutritional_keywords = [
                'proteína', 'proteina', 'carboidrato', 'lipídio', 'lipidio', 
                'caloria', 'kcal', 'energia', 'gordura', 'colesterol', 
                'fibra', 'cálcio', 'ferro', 'sódio', 'vitamina', 'mineral'
            ]
            
            found_nutritional_data = []
            
            # Verificar cada página do documento
            for i in range(num_pages):
                page = pdf_reader.pages[i]
                text = page.extract_text()
                
                # Procurar por padrões de dados nutricionais
                # Padrões comuns para dados nutricionais
                patterns = [
                    r'(\d+[,\.]?\d*)\s*(?:g|mg|mcg|kcal|kj)\s+(?:prote[ií]na|carboidrato|lip[ií]dio)',
                    r'(?:prote[ií]na|carboidrato|lip[ií]dio)\s*[:\-\s]+(\d+[,\.]?\d*)\s*(?:g|mg|mcg|kcal|kj)',
                    r'energia\s*[:\-\s]+(\d+[,\.]?\d*)\s*kcal',
                    r'calorias?\s*[:\-\s]+(\d+[,\.]?\d*)\s*(?:kcal|cal)',
                ]
                
                for pattern in patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    if matches:
                        found_nutritional_data.append({
                            'page': i+1,
                            'matches': matches,
                            'context': text[:200]  # Primeiros 200 caracteres como contexto
                        })
                        
                # Verificar se há palavras-chave nutricionais
                for keyword in nutritional_keywords:
                    if keyword.lower() in text.lower():
                        # Extrair contexto ao redor da palavra-chave
                        keyword_positions = [m.start() for m in re.finditer(re.escape(keyword), text, re.IGNORECASE)]
                        for pos in keyword_positions:
                            start = max(0, pos - 100)
                            end = min(len(text), pos + 200)
                            context = text[start:end]
                            
                            found_nutritional_data.append({
                                'page': i+1,
                                'keyword': keyword,
                                'context': context
                            })
            
            print(f"\nForam encontrados {len(found_nutritional_data)} ocorrências relacionadas a dados nutricionais:")
            
            # Agrupar e mostrar os resultados
            for idx, data in enumerate(found_nutritional_data[:20], 1):  # Mostrar apenas os primeiros 20
                print(f"\n{idx}. Página {data['page']}")
                if 'matches' in data:
                    print(f"   Dados encontrados: {data['matches']}")
                if 'keyword' in data:
                    print(f"   Palavra-chave: {data['keyword']}")
                print(f"   Contexto: {data['context'][:150]}...")
                
            if len(found_nutritional_data) > 20:
                print(f"\n... e mais {len(found_nutritional_data) - 20} ocorrências.")
                
            return found_nutritional_data
    except Exception as e:
        print(f"Erro ao processar PDF: {e}")
        return []

def main():
    pdf_path = r'C:\Nutri 4.0\docs\liv50000.pdf'
    
    if not os.path.exists(pdf_path):
        print(f"Arquivo não encontrado: {pdf_path}")
        return
    
    print("Procurando por dados nutricionais específicos no PDF...")
    nutritional_data = extract_specific_nutritional_data(pdf_path)
    
    if nutritional_data:
        print(f"\nO PDF contém informações nutricionais que podem ser usadas para preencher os dados faltantes nas tabelas.")
        print("Essas informações podem estar presentes em formato textual ou tabelas que precisam ser extraídas e convertidas.")
    else:
        print("\nNão foram encontradas informações nutricionais específicas no PDF.")

if __name__ == "__main__":
    main()