
import os
import django
import json
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from branding.views import UserBrandingViewSet
from branding.models import UserBranding

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

User = get_user_model()
user = User.objects.get(email='andersoncarlosvp@gmail.com')

factory = APIRequestFactory()
view = UserBrandingViewSet.as_view({'patch': 'me'})

# Simular o request que o subagent fez (apenas endereço)
request = factory.patch('/api/v1/branding/branding/me', {'address': 'Rua Teste, 123'})
force_authenticate(request, user=user)

try:
    response = view(request)
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.data}")
except Exception as e:
    import traceback
    print("Caught Exception:")
    traceback.print_exc()
