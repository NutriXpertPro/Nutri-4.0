import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from diets.search_utils import calcular_score_radical, normalizar_para_scoring

def test_clinical_ranking():
    query = "filé de frango"
    tokens = normalizar_para_scoring(query)
    
    candidates = [
        "Filé de frango à parmegiana, (filé de peito de frango, à milanesa (farinha de trigo, ovo e farinha de rosca, frita em imersão), c/ molho de tomate (tomate, c/ óleo, cebola e alho), muçarela, c/ sal)",
        "Filé de frango, grelhado",
        "Filé de frango, cozido",
        "Frango, peito, sem pele, cru",
        "Peito de frango grelhado",
        "Filé de frango à milanesa"
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
        print(f"Score: {score:6.2f} | {name[:80]}...")

if __name__ == "__main__":
    test_clinical_ranking()
