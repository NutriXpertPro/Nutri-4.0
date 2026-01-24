#!/usr/bin/env python3
"""
Script para extrair texto do PDF liv50000.pdf e verificar se contém dados nutricionais
"""

import PyPDF2
import os

def extract_pdf_info(pdf_path):
    """Extrai informações do PDF para determinar se contém dados nutricionais"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            print(f"Número total de páginas: {num_pages}")
            
            # Verificar as primeiras 10 páginas para encontrar conteúdo relevante
            for i in range(min(10, num_pages)):
                page = pdf_reader.pages[i]
                text = page.extract_text()
                
                # Verificar se há indícios de dados nutricionais
                keywords = [
                    'proteína', 'proteina', 'carboidrato', 'lipídio', 'lipidio', 
                    'caloria', 'kcal', 'energia', 'gordura', 'alimento', 'tabela',
                    'nutricional', 'macronutriente', 'vitamina', 'mineral'
                ]
                
                found_keywords = [kw for kw in keywords if kw.lower() in text.lower()]
                
                if found_keywords:
                    print(f"\nPágina {i+1} - Palavras-chave encontradas: {found_keywords}")
                    print(f"Texto (primeiros 1000 caracteres):\n{text[:1000]}")
                    print("-" * 50)
                    
            # Verificar últimas 5 páginas também
            for i in range(max(0, num_pages-5), num_pages):
                page = pdf_reader.pages[i]
                text = page.extract_text()
                
                keywords = [
                    'proteína', 'proteina', 'carboidrato', 'lipídio', 'lipidio', 
                    'caloria', 'kcal', 'energia', 'gordura', 'alimento', 'tabela',
                    'nutricional', 'macronutriente', 'vitamina', 'mineral'
                ]
                
                found_keywords = [kw for kw in keywords if kw.lower() in text.lower()]
                
                if found_keywords:
                    print(f"\nPágina {i+1} (final) - Palavras-chave encontradas: {found_keywords}")
                    print(f"Texto (últimos 1000 caracteres):\n{text[-1000:]}")
                    print("-" * 50)
                    
            return True
    except Exception as e:
        print(f"Erro ao processar PDF: {e}")
        return False

def main():
    pdf_path = r'C:\Nutri 4.0\docs\liv50000.pdf'
    
    if not os.path.exists(pdf_path):
        print(f"Arquivo não encontrado: {pdf_path}")
        return
    
    print("Analisando o PDF para verificar se contém dados nutricionais...")
    success = extract_pdf_info(pdf_path)
    
    if success:
        print("\nAnálise concluída. Verifique acima se foram encontradas palavras-chave relacionadas a dados nutricionais.")
    else:
        print("\nFalha na análise do PDF.")

if __name__ == "__main__":
    main()