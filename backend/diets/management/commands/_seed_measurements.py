# Este script deve ser executado no contexto do shell do Django.
# Exemplo de como executar: python manage.py shell < seed_database.py

import json
from diets.models import AlimentoTACO, AlimentoTBCA

def seed_measurements():
    with open('medidas_caseiras.json', 'r', encoding='utf-8') as f:
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
            print(f"Atualizado (TACO): {nome} - {medida} ({gramas}g)")
            continue # Pula para o próximo item

        # Se não encontrar na TACO, tenta na TBCA
        alimento_tbca = AlimentoTBCA.objects.filter(codigo=codigo).first()
        if alimento_tbca:
            alimento_tbca.unidade_caseira = medida
            alimento_tbca.peso_unidade_caseira_g = gramas
            alimento_tbca.save()
            updated_count += 1
            print(f"Atualizado (TBCA): {nome} - {medida} ({gramas}g)")
            continue

        print(f"AVISO: Alimento com código {codigo} ({nome}) não encontrado em nenhuma tabela.")
        not_found_count += 1

    print(f"\nConcluído! {updated_count} alimentos atualizados.")
    if not_found_count > 0:
        print(f"{not_found_count} alimentos não foram encontrados.")

# Para executar, chame a função.
# seed_measurements()
