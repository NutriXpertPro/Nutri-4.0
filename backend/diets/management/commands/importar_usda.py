from django.core.management.base import BaseCommand
from diets.models import AlimentoUSDA
import json
import os

class Command(BaseCommand):
    help = 'Importa dados do USDA FoodData Central'

    def handle(self, *args, **options):
        from django.conf import settings
        
        file_path = os.path.join(settings.BASE_DIR, 'usda_alimentos.json')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {file_path}'))
            return

        self.stdout.write('Carregando dados USDA...')
        with open(file_path, 'r', encoding='utf-8') as f:
            alimentos_json = json.load(f)

        importados = 0
        atualizados = 0
        
        total = len(alimentos_json)
        self.stdout.write(f'Total de alimentos para importar: {total}')
        
        for item in alimentos_json:
            try:
                alimento, created = AlimentoUSDA.objects.update_or_create(
                    fdc_id=item['fdc_id'],
                    defaults={
                        'nome': item['nome'],
                        'categoria': item['categoria'],
                        'energia_kcal': item['energia_kcal'],
                        'proteina_g': item['proteina_g'],
                        'lipidios_g': item['lipidios_g'],
                        'carboidrato_g': item['carboidrato_g'],
                        'fibra_g': item.get('fibra_g'),
                        'sodio_mg': item.get('sodio_mg'),
                        'ferro_mg': item.get('ferro_mg'),
                        'calcio_mg': item.get('calcio_mg'),
                        'vitamina_c_mg': item.get('vitamina_c_mg'),
                        'vitamina_a_mcg': item.get('vitamina_a_mcg'),
                        'vitamina_d_mcg': item.get('vitamina_d_mcg'),
                        'porcao_padrao_g': item.get('porcao_padrao_g', 100),
                    }
                )
                
                if created:
                    importados += 1
                else:
                    atualizados += 1
            
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Erro ao importar '{item.get('nome')}': {e}"))

        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Importação USDA concluída!\n'
            f'   Novos: {importados}\n'
            f'   Atualizados: {atualizados}'
        ))
