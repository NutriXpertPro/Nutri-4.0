
import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.views import FoodSubstitutionRuleViewSet

class MockFood:
    def __init__(self, nome, grupo=""):
        self.nome = nome
        self.grupo = grupo

def test_groups():
    view = FoodSubstitutionRuleViewSet()
    foods = [
        "Arroz, integral, cru",
        "Bolo, pronto, chocolate",
        "Biscoito, doce, recheado com morango",
        "Batata, doce, cozida",
        "Inhame, cru",
        "Macarrão, carbonara",
        "Espinafre, cru"
    ]
    
    print(f"{'NOME':<40} | {'GRUPO'}")
    print("-" * 55)
    for f_name in foods:
        mock = MockFood(f_name)
        group = view._get_professional_group(mock)
        print(f"{f_name:<40} | {group}")

if __name__ == "__main__":
    test_groups()
