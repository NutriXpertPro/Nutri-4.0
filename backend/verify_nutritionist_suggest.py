
import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.views import FoodSubstitutionRuleViewSet
from diets.models import AlimentoTACO
from rest_framework.test import APIRequestFactory
from rest_framework.response import Response

def verify_suggest():
    print("=== TESTANDO SUGESTÕES PARA ARROZ INTEGRAL CRU ===")
    factory = APIRequestFactory()
    view = FoodSubstitutionRuleViewSet.as_view({'get': 'suggest'})
    
    # Arroz, integral, cru (ID 17 na TACO 4.0, mas vamos buscar pelo nome)
    arroz = AlimentoTACO.objects.filter(nome__icontains='Arroz, integral, cru').first()
    if not arroz:
        print("Erro: Arroz integral não encontrado no DB")
        return

    request = factory.get('/api/v1/diets/rules/suggest/', {
        'food_id': arroz.id,
        'food_source': 'TACO',
        'diet_type': 'normocalorica',
        'quantity': 100
    })
    
    # Mock user for request
    from django.contrib.auth import get_user_model
    User = get_user_model()
    admin = User.objects.filter(is_superuser=True).first()
    from rest_framework.request import Request
    drf_request = Request(request)
    drf_request.user = admin
    
    response = FoodSubstitutionRuleViewSet().suggest(drf_request)
    
    if response.status_code == 200:
        subs = response.data['substitutions']
        print(f"\nRESULTADOS PARA: {arroz.nome} (100g - {arroz.energia_kcal} kcal)")
        print(f"{'SUGGESTAO':<40} | {'QTDE':<10} | {'KCAL':<10}")
        print("-" * 70)
        
        for s in subs:
            food = s['food']
            qty = s['suggested_quantity']
            sub_kcal = (qty / 100.0) * food['energia_kcal']
            print(f"{food['nome'][:40]:<40} | {qty:<10} | {sub_kcal:<10.1f}")
            
            name = food['nome'].lower()
            if any(x in name for x in ["abacaxi", "abobrinha", "abóbora", "abacate"]):
                print(f"  !!! ALERTA: {food['nome']} encontrado em grupo CARB!")
    else:
        print(f"Erro: {response.status_code}")

if __name__ == "__main__":
    verify_suggest()
