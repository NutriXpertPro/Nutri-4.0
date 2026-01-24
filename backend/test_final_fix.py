import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from diets.search_utils import calcular_score_radical, normalizar_para_scoring

def test_final_fix():
    query = "file de frango"
    tokens = normalizar_para_scoring(query)
    print(f"Tokens: {tokens}")
    
    candidates = [
        "Frango, filé à milanesa",
        "Filé de frango, grelhado",
        "Filé de frango, cozido",
        "Filé de frango, cru",
        "Salada, Caesar, (peito de frango grelhado, crouching, maionese, file de anchova)",
        "Filé de frango à parmegiana",
        "Filé de frango, cru",
    ]
    
    results = []
    for name in candidates:
        score = calcular_score_radical(name, tokens)
        results.append((name, score))
    
    # Sort by score descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    print(f"\nBusca por: '{query}'")
    print("-" * 60)
    for name, score in results:
        status = "TOP" if score > 100 else "PENALIZED"
        print(f"Score: {score:8.2f} | [{status}] {name[:100]}...")

if __name__ == "__main__":
    test_final_fix()
