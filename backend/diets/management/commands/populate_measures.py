
from django.core.management.base import BaseCommand
from diets.models import MedidaCaseira, AlimentoMedidaIBGE
import json
import os

class Command(BaseCommand):
    help = 'Popula o banco de dados com medidas do IBGE'

    def handle(self, *args, **kwargs):
        # backend/diets/management/commands/populate_measures.py
        cmd_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(cmd_dir))))
        # backend_dir deve ser c:\Nutri 4.0\backend
        
        # O arquivo está em c:\Nutri 4.0\docs\medidas_alimentos.json
        # backend_dir anterior subiu 4 niveis, voltando para c:\Nutri 4.0\backend se backend for raiz do projeto django
        # Vamos assumir que estamos rodando de c:\Nutri 4.0\backend.
        
        # Ajuste seguro: pegar o CWD se rodamos manage.py do backend
        cwd = os.getcwd() 
        # Se rodamos 'python manage.py ...' de 'c:\Nutri 4.0\backend', cwd é este.
        
        json_path = os.path.join(os.path.dirname(cwd), 'docs', 'medidas_alimentos.json')
        # Tenta outro caminho se falhar
        if not os.path.exists(json_path):
             json_path = os.path.join(cwd, '..', 'docs', 'medidas_alimentos.json')

        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {json_path}'))
            return

        self.stdout.write(f"Lendo {json_path}...")
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 1. Medidas Caseiras
        self.stdout.write("Populando Medidas Caseiras...")
        medidas_caseiras = data.get('medidas_caseiras', [])
        medidas_map = {}
        
        for m in medidas_caseiras:
            nome = m['nome']
            peso_medio = m.get('peso_medio_g')
            
            obj, created = MedidaCaseira.objects.update_or_create(
                nome=nome,
                defaults={'peso_medio_g': peso_medio}
            )
            medidas_map[nome] = obj
                
        self.stdout.write(self.style.SUCCESS(f"{len(medidas_caseiras)} tipos de medidas processados."))

        # 2. Alimentos
        self.stdout.write("Populando Alimentos e Relacionamentos...")
        alimentos = data.get('alimentos', [])
        records_processed = 0
        records_created = 0
        
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
                
                preparacao_key = 'nao_aplica'
                for key, val in PREP_MAP.items():
                    if key in preparacao_texto:
                        preparacao_key = val
                        break
                
                medida_obj = medidas_map.get(nome_medida)
                if not medida_obj:
                    medida_obj, _ = MedidaCaseira.objects.get_or_create(nome=nome_medida)
                    medidas_map[nome_medida] = medida_obj

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
                    self.stdout.write(self.style.WARNING(f"Erro ao salvar {nome_alimento}: {e}"))
                    
                records_processed += 1
                if records_processed % 2000 == 0:
                    self.stdout.write(f"Processados {records_processed}...")

        self.stdout.write(self.style.SUCCESS(f"Finalizado! {records_created} registros inseridos."))
