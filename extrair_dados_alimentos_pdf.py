#!/usr/bin/env python3
"""
Script para extrair dados nutricionais específicos de alimentos do PDF liv50000.pdf
"""

import PyPDF2
import os
import re
import csv

def extract_food_nutrition_data(pdf_path):
    """Extrai dados nutricionais específicos de alimentos do PDF"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            # Procurar por padrões que indiquem dados nutricionais de alimentos específicos
            nutrition_data = []
            
            # Procurar em todas as páginas
            for i in range(num_pages):
                page = pdf_reader.pages[i]
                text = page.extract_text()
                
                # Procurar por padrões que indiquem tabelas nutricionais
                # Padrões comuns em tabelas de composição nutricional
                patterns = [
                    # Padrão para identificar alimentos com códigos e medidas
                    r'(\d+)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,\'\-\.\d]+?)\s+(\d+)\s+Não se aplica',
                    # Outro padrão com unidades de medida
                    r'(\d+)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,\'\-\.\d]+?)\s+\d+\s+Colher',
                    # Padrão para alimentos com medidas caseiras
                    r'([A-Z\d]+)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s,\'\-\.\d\(]+?)\s+(\d+)\s+([A-Za-z\s]+?)\s+\d+\s+Colher',
                ]
                
                for pattern in patterns:
                    matches = re.findall(pattern, text)
                    if matches:
                        for match in matches:
                            # Verificar se parece ser um alimento com dados nutricionais
                            if len(match) >= 2:
                                food_code = match[0] if len(match) > 0 else ""
                                food_name = match[1] if len(match) > 1 else ""
                                
                                # Filtrar por nomes que parecem ser alimentos
                                food_indicators = ['farinha', 'trigo', 'soja', 'proteína', 'proteina', 
                                                'farelo', 'fibra', 'leite', 'carne', 'arroz', 'feijão', 
                                                'feijao', 'batata', 'óleo', 'oleo', 'açúcar', 'acucar']
                                
                                if any(indicator in food_name.lower() for indicator in food_indicators):
                                    nutrition_data.append({
                                        'page': i+1,
                                        'code': food_code,
                                        'name': food_name.strip(),
                                        'full_text': text[:500]  # Contexto
                                    })
            
            return nutrition_data
    except Exception as e:
        print(f"Erro ao processar PDF: {e}")
        return []

def save_to_csv(data, filename):
    """Salva os dados extraídos em um arquivo CSV"""
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['page', 'code', 'name', 'full_text']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in data:
            writer.writerow(row)

def main():
    pdf_path = r'C:\Nutri 4.0\docs\liv50000.pdf'
    
    if not os.path.exists(pdf_path):
        print(f"Arquivo não encontrado: {pdf_path}")
        return
    
    print("Extraindo dados nutricionais de alimentos do PDF...")
    food_nutrition_data = extract_food_nutrition_data(pdf_path)
    
    print(f"\nForam encontrados {len(food_nutrition_data)} registros potenciais de alimentos com dados nutricionais:")
    
    # Mostrar os primeiros resultados
    for idx, data in enumerate(food_nutrition_data[:20], 1):
        print(f"\n{idx}. Página {data['page']}")
        print(f"   Código: {data['code']}")
        print(f"   Nome: {data['name']}")
        print(f"   Contexto: {data['full_text'][:100]}...")
    
    if len(food_nutrition_data) > 20:
        print(f"\n... e mais {len(food_nutrition_data) - 20} registros.")
    
    # Salvar todos os dados em CSV para análise posterior
    if food_nutrition_data:
        csv_filename = "dados_alimentos_extraidos_pdf.csv"
        save_to_csv(food_nutrition_data, csv_filename)
        print(f"\nDados salvos em: {csv_filename}")
        
        print("\nCONCLUSÃO:")
        print("O PDF 'liv50000.pdf' contém uma Tabela de Medidas Referidas para os Alimentos Consumidos no Brasil.")
        print("Esta tabela contém códigos e nomes de alimentos com medidas caseiras padrão.")
        print("Embora o PDF contenha informações sobre alimentos, ele foca mais em medidas caseiras do que em composição nutricional detalhada.")
        print("Os dados nutricionais detalhados (proteínas, carboidratos, lipídios) provavelmente estão em outro documento da série POF 2008-2009.")
        print("O documento menciona que existe uma publicação separada: 'Tabelas de composição nutricional dos alimentos consumidos no Brasil'.")
    else:
        print("\nNão foram encontrados dados nutricionais específicos no PDF.")

if __name__ == "__main__":
    main()