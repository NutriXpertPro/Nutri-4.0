import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.views import FoodSearchViewSet
from diets.models import FavoriteFood
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

if not user:
    print("No user found")
else:
    print(f"Testing for user: {user.email}")
    viewset = FoodSearchViewSet()
    
    # Mock request
    class MockRequest:
        def __init__(self, user):
            self.user = user

    request = MockRequest(user)
    
    try:
        response = viewset.favorites(request)
        print("Success!")
        print(f"Results count: {len(response.data.get('results', []))}")
    except Exception as e:
        print(f"Error caught: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
