
import os
import django
import sys

# Setup Django with console backend to avoid SMTP hang
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

# Monkey patch settings before setup
from django.conf import settings
if not settings.configured:
    os.environ['EMAIL_BACKEND'] = 'django.core.mail.backends.console.EmailBackend'

django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()
email = 'anderson_28vp@hotmail.com'

try:
    user = User.objects.get(email=email)
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/auth/reset-password?uid={uid}&token={token}"
    
    # Write to file to be safe
    with open('reset_link_final.txt', 'w') as f:
        f.write(reset_link)
    print(f"SUCCESS: Link escrito em reset_link_final.txt")
except Exception as e:
    with open('reset_link_final.txt', 'w') as f:
        f.write(f"ERRO: {str(e)}")
    print(f"FAILURE: {e}")
