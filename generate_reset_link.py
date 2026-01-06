
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

print(f"DEBUG: Buscando usuario com email {email}...", flush=True)

try:
    user = User.objects.get(email=email)
    print(f"DEBUG: Usuario encontrado. ID={user.id}", flush=True)
    
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Garantir que settings.FRONTEND_URL esteja definido
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/auth/reset-password?uid={uid}&token={token}"
    
    print(f"--- RESULTADO ---", flush=True)
    print(f"EMAIL_ALVO: {email}", flush=True)
    print(f"LINK_GERADO: {reset_link}", flush=True)
    print(f"--- FIM ---", flush=True)
    
except User.DoesNotExist:
    print(f"ERRO: Usuario com o email {email} nao encontrado.", flush=True)
except Exception as e:
    print(f"ERRO FATAL: {e}", flush=True)
    import traceback
    traceback.print_exc()

sys.stdout.flush()
