"""
Script para extrair medidas de alimentos do PDF liv50000.pdf e gerar JSON
Formato das linhas:
CÓDIGO ALIMENTO PREP_CODE PREP_NOME MEDIDA_CODE MEDIDA_NOME ... QUANTIDADE(g) ...
"""
import json
import re
from PyPDF2 import PdfReader
from collections import defaultdict

def parse_measure_line(line):
    """Parse uma linha de medida e extrai os dados relevantes"""
    # Padrão: código numérico no início
    # Exemplo: "6400401 Batata-doce 2 Cozido(a) 12 Colher de arroz/servir 81 Pedaço 100 2 Batata-doce cozida - colher de servir"
    
    # Ignorar linhas de cabeçalho/formatação
    skip_patterns = [
        "Código e descrição",
        "do alimento",
        "da preparação",
        "do tipo de medida",
        "Tabela de Medidas",
        "Pesquisa de Orçamentos",
        "Descrição da Tabela",
        "(continuação)",
        "Quan-",
        "tidade",
        "(g)",
        "___"
    ]
    
    for pattern in skip_patterns:
        if pattern in line:
            return None
    
    # Tentar extrair dados
    # Formato: CÓDIGO ALIMENTO PREP_CODE PREP_NOME MEDIDA_CODE MEDIDA_NOME PADRAO_CODE PADRAO_NOME QTD_G ...
    match = re.match(r'^(\d{7})\s+(.+?)\s+(\d+)\s+(.+?)\s+(\d+)\s+(.+?)\s+(\d+)\s+(.+?)\s+([\d,\.]+)\s+', line)
    
    if match:
        return {
            'codigo_alimento': match.group(1),
            'alimento': match.group(2).strip(),
            'codigo_preparacao': int(match.group(3)),
            'preparacao': match.group(4).strip(),
            'codigo_medida': int(match.group(5)),
            'medida': match.group(6).strip(),
            'codigo_medida_padrao': int(match.group(7)),
            'medida_padrao': match.group(8).strip(),
            'quantidade_g': float(match.group(9).replace(',', '.'))
        }
    
    return None

def extract_all_measures():
    """Extrai todas as medidas do PDF e gera JSON estruturado"""
    reader = PdfReader(r'C:\Nutri 4.0\docs\liv50000.pdf')
    
    print(f"Processando {len(reader.pages)} páginas...")
    
    # Estrutura para armazenar as medidas
    medidas_por_alimento = defaultdict(list)
    medidas_unicas = set()
    total_registros = 0
    
    # Extrair todas as páginas relevantes (51 em diante)
    for page_num in range(50, len(reader.pages)):
        page_text = reader.pages[page_num].extract_text()
        if not page_text:
            continue
            
        lines = page_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line or len(line) < 10:
                continue
                
            parsed = parse_measure_line(line)
            if parsed:
                total_registros += 1
                
                # Adicionar à lista do alimento
                key = f"{parsed['codigo_alimento']}_{parsed['alimento']}"
                medidas_por_alimento[key].append({
                    'medida': parsed['medida'],
                    'quantidade_g': parsed['quantidade_g'],
                    'preparacao': parsed['preparacao']
                })
                
                # Coletar medidas únicas
                medidas_unicas.add(parsed['medida'])
        
        if page_num % 50 == 0:
            print(f"  Página {page_num}... ({total_registros} registros)")
    
    print(f"\nTotal de registros extraídos: {total_registros}")
    print(f"Total de alimentos únicos: {len(medidas_por_alimento)}")
    print(f"Total de tipos de medida únicos: {len(medidas_unicas)}")
    
    # Criar lista de medidas caseiras únicas com pesos padrão
    # Extrair os pesos mais comuns para cada medida
    medidas_padrao = {}
    for alimento, medidas in medidas_por_alimento.items():
        for m in medidas:
            medida_nome = m['medida']
            qtd = m['quantidade_g']
            
            if medida_nome not in medidas_padrao:
                medidas_padrao[medida_nome] = []
            medidas_padrao[medida_nome].append(qtd)
    
    # Calcular peso médio para cada medida
    medidas_caseiras = []
    for medida, quantidades in sorted(medidas_padrao.items()):
        # Filtrar valores muito extremos (1g para grama, 1000g para quilo)
        quantidades_filtradas = [q for q in quantidades if 1 < q < 1000]
        if quantidades_filtradas:
            media = sum(quantidades_filtradas) / len(quantidades_filtradas)
        else:
            media = None
        
        medidas_caseiras.append({
            'nome': medida,
            'peso_medio_g': round(media, 1) if media else None,
            'quantidade_amostras': len(quantidades)
        })
    
    # Ordenar por nome
    medidas_caseiras.sort(key=lambda x: x['nome'])
    
    # Criar JSON final
    resultado = {
        'fonte': 'IBGE - Pesquisa de Orçamentos Familiares 2008-2009',
        'descricao': 'Tabela de Medidas Referidas para os Alimentos Consumidos no Brasil',
        'total_registros': total_registros,
        'total_alimentos': len(medidas_por_alimento),
        'medidas_caseiras': medidas_caseiras,
        'alimentos': []
    }
    
    # Adicionar alimentos com suas medidas
    for key, medidas in sorted(medidas_por_alimento.items()):
        codigo, nome = key.split('_', 1)
        
        # Agrupar medidas únicas por tipo
        medidas_unicas_alimento = {}
        for m in medidas:
            chave = f"{m['medida']}_{m['preparacao']}"
            if chave not in medidas_unicas_alimento:
                medidas_unicas_alimento[chave] = m
        
        resultado['alimentos'].append({
            'codigo': codigo,
            'nome': nome,
            'medidas': list(medidas_unicas_alimento.values())
        })
    
    # Salvar JSON
    output_path = r'C:\Nutri 4.0\docs\medidas_alimentos.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"\nJSON salvo em: {output_path}")
    
    # Mostrar algumas medidas caseiras encontradas
    print("\n=== MEDIDAS CASEIRAS ENCONTRADAS ===")
    for m in medidas_caseiras[:30]:
        peso = f"{m['peso_medio_g']}g" if m['peso_medio_g'] else "N/A"
        print(f"  {m['nome']}: {peso} ({m['quantidade_amostras']} amostras)")
    
    return resultado

if __name__ == "__main__":
    extract_all_measures()
