import os
import django
import sys
import traceback

# Adicionar o diretório do projeto ao path
sys.path.append('c:/Nutri 4.0/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import AlimentoTACO, FoodSubstitutionRule
from diets.views import FoodSubstitutionRuleViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

def debug():
    factory = APIRequestFactory()
    view = FoodSubstitutionRuleViewSet.as_view({'get': 'suggest'})
    user = User.objects.first()
    
    # Arroz, integral, cru (ID 2 na TACO)
    rice = AlimentoTACO.objects.get(id=2)
    print(f"DEBUG: Testing for: {rice.nome} (ID: {rice.id})")
    
    request = factory.get('/api/v1/diets/substitutions/suggest/', {
        'food_id': rice.id,
        'food_source': 'TACO',
        'diet_type': 'normocalorica',
        'quantity': 100
    })
    
    if user:
        force_authenticate(request, user=user)
    
    try:
        response = view(request)
        print(f"DEBUG: Status: {response.status_code}")
        if response.status_code != 200:
            print(f"DEBUG: Response data: {response.data}")
        else:
            print(f"DEBUG: Success! Found {len(response.data.get('substitutions', []))} substitutions.")
    except Exception:
        print("DEBUG: Caught Exception in view!")
        traceback.print_exc()

if __name__ == "__main__":
    debug()
