
import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from diets.views import FoodSearchViewSet
from users.models import User

def test_food_endpoint():
    print("--- STARTING FOOD API DIAGNOSTIC ---")
    
    # 1. Get a test user
    user = User.objects.first()
    if not user:
        print("ERROR: No users found in database!")
        return
    print(f"Using user: {user.email}")

    factory = APIRequestFactory()
    view = FoodSearchViewSet.as_view({'get': 'list'})

    # 2. Test 1: Empty Search (Should return default items)
    print("\nTEST 1: Empty Search")
    request = factory.get('/api/v1/diets/foods/')
    request.user = user
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.data
            count = data.get('count', 0) if isinstance(data, dict) else len(data.get('results', []))
            print(f"Results Count: {count}")
            if count > 0 and isinstance(data, dict) and 'results' in data:
                print(f"First Item: {data['results'][0].get('nome')}")
        else:
            print(f"ERROR: {response.data}")
    except Exception as e:
        print(f"EXCEPTION in Test 1: {e}")
        import traceback
        traceback.print_exc()

    # 3. Test 2: Search specific term 'arroz'
    print("\nTEST 2: Search 'arroz' (TACO)")
    request = factory.get('/api/v1/diets/foods/', {'search': 'arroz', 'source': 'TACO'})
    request.user = user
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.data
            results = data.get('results', [])
            print(f"Results Count: {len(results)}")
            if results:
                print(f"Top Result: {results[0].get('nome')} | Source: {results[0].get('source')}")
        else:
            print(f"ERROR: {response.data}")
    except Exception as e:
        print(f"EXCEPTION in Test 2: {e}")
        traceback.print_exc()

    print("\n--- DIAGNOSTIC COMPLETE ---")

if __name__ == '__main__':
    try:
        test_food_endpoint()
    except Exception as e:
        print(f"CRITICAL SETUP ERROR: {e}")
