#!/usr/bin/env python
# Script para verificar se os dados de alimentos foram importados corretamente

import os
import sys
import django

# Configurar o ambiente Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA, AlimentoMedidaIBGE

def check_food_data():
    print("Verificando dados de alimentos...")
    print("=" * 50)
    
    # Contar alimentos em cada tabela
    taco_count = AlimentoTACO.objects.count()
    tbca_count = AlimentoTBCA.objects.count()
    usda_count = AlimentoUSDA.objects.count()
    ibge_count = AlimentoMedidaIBGE.objects.count()
    
    print(f"TACO: {taco_count} alimentos")
    print(f"TBCA: {tbca_count} alimentos")
    print(f"USDA: {usda_count} alimentos")
    print(f"IBGE Medidas: {ibge_count} entradas")
    
    if taco_count == 0 and tbca_count == 0 and usda_count == 0:
        print("\nAVISO: Não há alimentos cadastrados nas tabelas principais!")
        print("Execute os comandos de importação:")
        print("  python manage.py importar_taco")
        print("  python manage.py importar_tbca")
        print("  python manage.py importar_usda")
    else:
        print("\n✓ Dados de alimentos encontrados")
        
        # Mostrar alguns exemplos
        if taco_count > 0:
            sample_taco = AlimentoTACO.objects.first()
            print(f"\nExemplo TACO: {sample_taco.nome if sample_taco else 'N/A'}")
        
        if tbca_count > 0:
            sample_tbca = AlimentoTBCA.objects.first()
            print(f"Exemplo TBCA: {sample_tbca.nome if sample_tbca else 'N/A'}")
            
        if usda_count > 0:
            sample_usda = AlimentoUSDA.objects.first()
            print(f"Exemplo USDA: {sample_usda.nome if sample_usda else 'N/A'}")

if __name__ == "__main__":
    check_food_data()