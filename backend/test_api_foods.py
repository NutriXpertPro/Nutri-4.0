import os
import sys
import django
# Imports serao feitos dentro do exec
from rest_framework.test import APIRequestFactory
from diets.views import FoodSearchViewSet
from django.contrib.auth import get_user_model

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

def test_viewWithUser():
    print("Testing FoodSearchViewSet.list...")
    factory = APIRequestFactory()
    # Mock user
    User = get_user_model()
    # Tenta pegar um usuário qualquer ou criar
    user = User.objects.first()
    if not user:
        print("No user found.")
        return

    view = FoodSearchViewSet.as_view({'get': 'list'})
    
    from rest_framework.test import force_authenticate
    
    # URL params
    url = '/api/v1/foods/?search=arroz'
    request = factory.get(url)
    force_authenticate(request, user=user)
    
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Error data: {response.data}")
        else:
            print(f"Success! Data count: {response.data.get('count')}")
            # print(response.data)
    except Exception as e:
        print(f"CRASH: {e}")
        import traceback
        traceback.print_exc()

test_viewWithUser()
