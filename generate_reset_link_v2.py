
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings

User = get_user_model()
email = 'anderson_28vp@hotmail.com'

try:
    user = User.objects.get(email=email)
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/auth/reset-password?uid={uid}&token={token}"
    
    with open('reset_link.txt', 'w') as f:
        f.write(reset_link)
except Exception as e:
    with open('reset_link.txt', 'w') as f:
        f.write(f"ERRO: {str(e)}")
