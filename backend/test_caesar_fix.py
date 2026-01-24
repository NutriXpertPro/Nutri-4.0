import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from diets.search_utils import calcular_score_radical, normalizar_para_scoring

def test_caesar_vs_file():
    query = "filé de frango"
    tokens = normalizar_para_scoring(query)
    print(f"Tokens da busca: {tokens}")
    
    candidates = [
        "Salada, Caesar, (alface americana, peito de frango grelhado, queijo parmesão ralado, croutons, molho para salada - filé de anchova, alho, molho de mostarda, molho inglês, suco de limão, vinagre de maçã, maionese, azeite de oliva, c/sal)",
        "Filé de frango, grelhado",
        "Filé de frango, cozido",
        "Peito de frango grelhado",
        "Filé de frango à parmegiana",
        "Frango, filé", # Test matching without 'de'
    ]
    
    results = []
    for name in candidates:
        score = calcular_score_radical(name, tokens)
        results.append((name, score))
    
    # Sort by score descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\nBusca por: '{query}'")
    print("-" * 50)
    for name, score in results:
        print(f"Score: {score:7.2f} | {name[:100]}...")

if __name__ == "__main__":
    test_caesar_vs_file()
