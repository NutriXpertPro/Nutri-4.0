from django.core.management.base import BaseCommand
from diets.models import AlimentoTACO

class Command(BaseCommand):
    help = 'Importa dados da Tabela TACO para o banco de dados'

    def handle(self, *args, **options):
        import json
        import os
        from django.conf import settings

        file_path = os.path.join(settings.BASE_DIR, 'taco.json')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {file_path}'))
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            alimentos_json = json.load(f)

        importados = 0
        atualizados = 0
        
        for item in alimentos_json:
            try:
                # Mapeamento de campos do JSON para o Modelo
                # O JSON tem campos como 'energy_kcal', 'protein_g', etc.
                # Alguns campos podem ser strings "NA", "Tr" ou "*", precisamos tratar
                
                def parse_float(val):
                    if isinstance(val, (int, float)):
                        return float(val)
                    if isinstance(val, str):
                        val = val.strip()
                        if val == 'NA' or val == 'Tr' or val == '' or val == '*':
                            return 0.0
                        return float(val.replace(',', '.'))
                    return 0.0

                dados = {
                    'codigo': str(item.get('id', '')),
                    'nome': item.get('description', ''),
                    'grupo': item.get('category', 'Outros'),
                    'energia_kcal': parse_float(item.get('energy_kcal')),
                    'proteina_g': parse_float(item.get('protein_g')),
                    'lipidios_g': parse_float(item.get('lipid_g')),
                    'carboidrato_g': parse_float(item.get('carbohydrate_g')),
                    'fibra_g': parse_float(item.get('fiber_g')),
                    'sodio_mg': parse_float(item.get('sodium_mg')),
                    'ferro_mg': parse_float(item.get('iron_mg')),
                    'calcio_mg': parse_float(item.get('calcium_mg')),
                    'vitamina_c_mg': parse_float(item.get('vitaminC_mg')),
                    # Campos adicionais que podem ser úteis
                    'peso_unidade_caseira_g': 100.0, # Padrão TACO é 100g
                    'unidade_caseira': 'g'
                }

                alimento, created = AlimentoTACO.objects.get_or_create(
                    codigo=dados['codigo'],
                    defaults=dados
                )
                
                if created:
                    importados += 1
                    if importados % 50 == 0:
                        self.stdout.write(f'Importados {importados}...')
                else:
                    # Atualizar dados existentes
                    for key, value in dados.items():
                        setattr(alimento, key, value)
                    alimento.save()
                    atualizados += 1
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Erro ao importar item {item.get('id')}: {e}"))

        self.stdout.write(
            self.style.SUCCESS(
                f'\nImportação concluída! {importados} novos alimentos importados, {atualizados} atualizados.'
            )
        )