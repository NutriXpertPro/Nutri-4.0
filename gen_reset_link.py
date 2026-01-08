import os
import django
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.conf import settings

User = get_user_model()

email = "anderson_28vp@hotmail.com"
user = User.objects.filter(email=email).first()

if user:
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    link = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"
    print(f"\n*** NOVO LINK DE RESET (valido por 24h) ***\n")
    print(link)
    print(f"\n")
else:
    print(f"Usuario {email} nao encontrado")
