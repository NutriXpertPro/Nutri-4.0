import json
from django.core.management.base import BaseCommand
from diets.models import AlimentoTACO, AlimentoTBCA
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Seeds the database with food measurement data from medidas_caseiras.json'

    def handle(self, *args, **options):
        # Define o caminho para o arquivo JSON, assumindo que ele está na raiz do projeto
        json_file_path = os.path.join(settings.BASE_DIR.parent, 'medidas_caseiras.json')

        if not os.path.exists(json_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {json_file_path}'))
            return

        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        updated_count = 0
        not_found_count = 0

        for item in data:
            codigo = item['codigo_alimento']
            nome = item['nome_alimento']
            medida = item['medida_caseira']
            gramas = item['gramas']
            
            # Tenta encontrar o alimento na tabela TACO
            alimento_taco = AlimentoTACO.objects.filter(codigo=codigo).first()
            if alimento_taco:
                alimento_taco.unidade_caseira = medida
                alimento_taco.peso_unidade_caseira_g = gramas
                alimento_taco.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Atualizado (TACO): {nome} - {medida} ({gramas}g)"))
                continue

            # Se não encontrar na TACO, tenta na TBCA
            alimento_tbca = AlimentoTBCA.objects.filter(codigo=codigo).first()
            if alimento_tbca:
                alimento_tbca.unidade_caseira = medida
                alimento_tbca.peso_unidade_caseira_g = gramas
                alimento_tbca.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Atualizado (TBCA): {nome} - {medida} ({gramas}g)"))
                continue

            self.stdout.write(self.style.WARNING(f"AVISO: Alimento com código {codigo} ({nome}) não encontrado em nenhuma tabela."))
            not_found_count += 1

        self.stdout.write(self.style.SUCCESS(f"\nConcluído! {updated_count} alimentos atualizados."))
        if not_found_count > 0:
            self.stdout.write(self.style.WARNING(f"{not_found_count} alimentos não foram encontrados."))
