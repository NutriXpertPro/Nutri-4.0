
import os
import django
import pandas as pd
import xlrd

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, AlimentoTBCA

def audit_taco():
    print("\n--- Auditoria TACO (597 itens) ---")
    file_path = r"c:\Nutri 4.0\backend\temp_audit\taco_4_alimentos.csv"
    if not os.path.exists(file_path):
        print("Arquivo CSV TACO não encontrado.")
        return

    df = pd.read_csv(file_path, encoding='latin1', sep=';')
    
    # Detecção dinâmica de colunas para evitar erros de encoding
    col_name = [c for c in df.columns if "Descri" in c][0]
    col_kcal = [c for c in df.columns if "Energia(kcal)" in c or "kcal" in c.lower()][0]
    col_cho = [c for c in df.columns if "Carboidrato(g)" in c or "carboidrato" in c.lower()][0]

    print(f"Colunas ativas: Name={col_name}, Kcal={col_kcal}, CHO={col_cho}")
    
    discrepancies = []
    matches = 0
    missing = 0

    for _, row in df.iterrows():
        nome_oficial = str(row.get(col_name, ""))
        if not nome_oficial or "Descri" in nome_oficial or nome_oficial.strip() == "": continue
        
        # Busca no banco local
        # Tenta busca por nome completo, removendo espaços extras
        nome_clean = nome_oficial.strip()
        local_food = AlimentoTACO.objects.filter(nome__icontains=nome_clean[:40]).first()
        
        if local_food:
            try:
                def clean_float(val):
                    if pd.isna(val) or val == 'NA' or val == 'Tr' or str(val).strip() == '': return 0.0
                    return float(str(val).replace(',', '.'))

                kcal_of = clean_float(row.get(col_kcal, 0))
                cho_of = clean_float(row.get(col_cho, 0))

                # Se o oficial é > 0 mas o local é 0 ou muito diferente
                kcal_loc = float(local_food.energia_kcal)
                cho_loc = float(local_food.carboidrato_g)

                diff_perc_kcal = abs(kcal_loc - kcal_of) / (kcal_of if kcal_of > 0 else 1)
                
                # Flag de erro se a diferença for > 10% ou > 5kcal (mais rígido)
                if (kcal_of > 1 and diff_perc_kcal > 0.1) or (abs(kcal_loc - kcal_of) > 5):
                    discrepancies.append(f"ID {local_food.id} | {local_food.nome} | Kcal Local: {kcal_loc:.1f} vs Oficial: {kcal_of:.1f}")
                
                matches += 1
            except Exception as e:
                pass
        else:
            missing += 1

    print(f"\nResumo Auditoria TACO:")
    print(f"- Itens no arquivo oficial: {len(df)}")
    print(f"- Cruzados com sucesso: {matches}")
    print(f"- Não locais/Não mapeados: {missing}")
    print(f"- Alimentos com erro/divergência: {len(discrepancies)}")
    
    if discrepancies:
        print("\nPrimeiros 15 erros encontrados:")
        for d in discrepancies[:15]:
            print(d)

audit_taco()
