from django.core.management.base import BaseCommand
from diets.models import AlimentoTBCA
import json
import os

class Command(BaseCommand):
    help = 'Importa dados da TBCA (Tabela Brasileira de Composição de Alimentos - USP)'

    def handle(self, *args, **options):
        from django.conf import settings
        
        file_path = os.path.join(settings.BASE_DIR, 'tbca_alimentos.json')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {file_path}'))
            return

        self.stdout.write('Carregando dados TBCA...')
        with open(file_path, 'r', encoding='utf-8') as f:
            alimentos_json = json.load(f)

        importados = 0
        atualizados = 0
        erros = 0
        
        total = len(alimentos_json)
        self.stdout.write(f'Total de alimentos para importar: {total}')
        
        for i, item in enumerate(alimentos_json, 1):
            try:
                alimento, created = AlimentoTBCA.objects.update_or_create(
                    codigo=item['codigo'],
                    defaults={
                        'nome': item['nome'],
                        'grupo': item['grupo'],
                        'energia_kcal': item['energia_kcal'] or 0,
                        'proteina_g': item['proteina_g'] or 0,
                        'lipidios_g': item['lipidios_g'] or 0,
                        'carboidrato_g': item['carboidrato_g'] or 0,
                        'fibra_g': item['fibra_g'],
                        'sodio_mg': item['sodio_mg'],
                        'ferro_mg': item['ferro_mg'],
                        'calcio_mg': item['calcio_mg'],
                        'vitamina_c_mg': item['vitamina_c_mg'],
                        'vitamina_a_mcg': item['vitamina_a_mcg'],
                    }
                )
                
                if created:
                    importados += 1
                else:
                    atualizados += 1
                
                if i % 500 == 0:
                    self.stdout.write(f'Progresso: {i}/{total} ({(i/total*100):.1f}%)')
            
            except Exception as e:
                erros += 1
                if erros <= 10:
                    self.stdout.write(self.style.WARNING(f"Erro ao importar '{item.get('nome')}': {e}"))

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Importação TBCA concluída!\n'
            f'   Novos: {importados}\n'
            f'   Atualizados: {atualizados}\n'
            f'   Erros: {erros}'
        ))
