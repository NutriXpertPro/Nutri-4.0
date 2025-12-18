
import os
import django
import json
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from diets.models import MedidaCaseira, AlimentoMedidaIBGE

# Caminho relativo considerando execução da pasta backend
JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'medidas_alimentos.json')

def populate():
    if not os.path.exists(JSON_PATH):
        print(f"Erro: Arquivo não encontrado: {JSON_PATH}")
        return

    print(f"Lendo {JSON_PATH}...")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Medidas Caseiras (Tipos Gerais)
    print("Populando Medidas Caseiras...")
    medidas_caseiras = data.get('medidas_caseiras', [])
    medidas_map = {} # Cache para evitar queries repetidas
    
    for m in medidas_caseiras:
        nome = m['nome']
        peso_medio = m.get('peso_medio_g')
        
        obj, created = MedidaCaseira.objects.update_or_create(
            nome=nome,
            defaults={
                'peso_medio_g': peso_medio
            }
        )
        medidas_map[nome] = obj
        if created:
            print(f"  + Medida criada: {nome}")
            
    print(f"{len(medidas_caseiras)} tipos de medidas processados.")

    # 2. Alimentos e Vínculos
    print("Populando Alimentos e Relacionamentos (pode demorar)...")
    alimentos = data.get('alimentos', [])
    records_processed = 0
    records_created = 0
    
    # Preparando mapeamento de preparação para choices do model
    PREP_MAP = {
        'cozido': 'cozido', 'cozida': 'cozido',
        'frito': 'frito', 'frita': 'frito',
        'assado': 'assado', 'assada': 'assado',
        'cru': 'cru', 'crua': 'cru',
        'grelhado': 'grelhado', 'grelhada': 'grelhado',
        'refogado': 'refogado', 'refogada': 'refogado',
        'vapor': 'vapor',
    }

    for alimento in alimentos:
        codigo_ibge = alimento['codigo']
        nome_alimento = alimento['nome']
        
        for medida_data in alimento.get('medidas', []):
            nome_medida = medida_data['medida']
            peso_g = medida_data['quantidade_g']
            preparacao_texto = medida_data.get('preparacao', '').lower()
            
            # Tentar mapear preparação
            preparacao_key = 'nao_aplica'
            for key, val in PREP_MAP.items():
                if key in preparacao_texto:
                    preparacao_key = val
                    break
            
            # Buscar ou criar Objeto Medida
            medida_obj = medidas_map.get(nome_medida)
            if not medida_obj:
                medida_obj, _ = MedidaCaseira.objects.get_or_create(nome=nome_medida)
                medidas_map[nome_medida] = medida_obj

            # Criar vínculo
            # IMPORTANTE: AlimentoMedidaIBGE tem unique_together = ['codigo_ibge', 'medida', 'preparacao']
            # Se já existir, atualiza.
            
            try:
                AlimentoMedidaIBGE.objects.update_or_create(
                    codigo_ibge=codigo_ibge,
                    medida=medida_obj,
                    preparacao=preparacao_key,
                    defaults={
                        'nome_alimento': nome_alimento,
                        'peso_g': peso_g
                    }
                )
                records_created += 1
            except Exception as e:
                print(f"Erro ao salvar {nome_alimento} - {nome_medida}: {e}")
                
            records_processed += 1
            if records_processed % 1000 == 0:
                print(f"Processados {records_processed} registros...")

    print(f"Finalizado! {records_created} registros de medidas de alimentos inseridos.")

if __name__ == '__main__':
    populate()
