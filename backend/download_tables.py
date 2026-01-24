
import os
import requests

def download_file(url, filename):
    print(f"Baixando {url}...")
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Salvo: {filename}")
        return True
    except Exception as e:
        print(f"Erro ao baixar {url}: {e}")
        return False

# Setup directory
target_dir = r"c:\Nutri 4.0\backend\temp_audit"
if not os.path.exists(target_dir):
    os.makedirs(target_dir)

# Targets
downloads = [
    ("https://github.com/machine-learning-mocha/taco/raw/main/originais/Taco_4a_edicao_2011.xls", "taco_4.xls"),
    ("https://github.com/machine-learning-mocha/taco/raw/main/tabelas/alimentos.csv", "taco_4_alimentos.csv"),
    ("https://github.com/Thiagofs1211/Dieta_Python/raw/master/alimentos.csv", "combined_alimentos.csv")
]

for url, name in downloads:
    path = os.path.join(target_dir, name)
    download_file(url, path)
