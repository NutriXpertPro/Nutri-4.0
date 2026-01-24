import os
import django
import sys

# Adicionar o diretório do projeto ao path
sys.path.append('c:/Nutri 4.0/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, FoodSubstitutionRule
from diets.views import FoodSubstitutionRuleViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

def verify():
    factory = APIRequestFactory()
    view = FoodSubstitutionRuleViewSet.as_view({'get': 'suggest'})
    user = User.objects.first()
    
    # Arroz, integral, cru (ID 2 na TACO)
    rice = AlimentoTACO.objects.get(id=2)
    print(f"Testing for: {rice.nome} (ID: {rice.id})")
    
    # Request para dieta Normocalórica (que não tem regra para ID 2)
    request = factory.get('/api/v1/diets/substitutions/suggest/', {
        'food_id': rice.id,
        'food_source': 'TACO',
        'diet_type': 'normocalorica',
        'quantity': 100
    })
    force_authenticate(request, user=user)
    
    response = view(request)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        subs = response.data.get('substitutions', [])
        print(f"Found {len(subs)} substitutions via fallback.")
        for s in subs[:5]:
            print(f" - {s['food']['nome']} (Score: {s['similarity_score']})")
    else:
        print(f"Error: {response.data}")

if __name__ == "__main__":
    verify()
