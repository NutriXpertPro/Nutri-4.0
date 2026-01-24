import os
import django
import sys
import traceback

# Configurações do Django
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
    
    # Tenta pegar um nutricionista qualquer para autenticar
    user = User.objects.filter(is_staff=True).first() or User.objects.first()
    
    # Arroz, integral, cru (ID 2 na TACO)
    try:
        rice = AlimentoTACO.objects.get(id=2)
        print(f"DEBUG: Testing for: {rice.nome} (ID: {rice.id})")
    except AlimentoTACO.DoesNotExist:
        print("DEBUG: Alimento ID 2 (Arroz) não encontrado na TACO!")
        return

    request = factory.get('/api/v1/diets/substitutions/suggest/', {
        'food_id': rice.id,
        'food_source': 'TACO',
        'diet_type': 'normocalorica',
        'quantity': 100
    })
    
    if user:
        print(f"DEBUG: Authenticating with user: {user.email}")
        force_authenticate(request, user=user)
    else:
        print("DEBUG: WARNING - No user found for authentication!")
    
    try:
        response = view(request)
        print(f"DEBUG: Status: {response.status_code}")
        if response.status_code != 200:
            print(f"DEBUG: Response data: {response.data}")
        else:
            print(f"DEBUG: Success! Found {len(response.data.get('substitutions', []))} substitutions.")
    except Exception:
        print("DEBUG: EXCEPTION CAUGHT IN VIEW EXECUTION")
        traceback.print_exc()

if __name__ == "__main__":
    debug()
