
import os
import django
from django.conf import settings

# Setup Django if run directly
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
import secrets
import string

User = get_user_model()

def test_token_flow():
    print("--- Starting Token Flow Test ---")
    
    # 1. Create User (mimic Serializer)
    email = f"debug_{secrets.token_hex(4)}@example.com"
    alphabet = string.ascii_letters + string.digits + string.punctuation
    random_password = ''.join(secrets.choice(alphabet) for i in range(16))
    
    print(f"Creating user: {email}")
    user = User.objects.create(
        email=email, 
        name="Debug User", 
        user_type="paciente",
        is_active=True
    )
    user.set_password(random_password)
    user.save()
    
    print(f"User created. PK: {user.pk}, Password hash prefix: {user.password[:15]}...")
    
    # 2. Generate Token (mimic Task)
    # Fetch fresh from DB to be sure
    user_task = User.objects.get(pk=user.pk)
    token = default_token_generator.make_token(user_task)
    uid_encoded = urlsafe_base64_encode(force_bytes(user_task.pk))
    
    print(f"Token generated: {token}")
    print(f"UID Encoded: {uid_encoded}")
    
    # 3. Validate Token (mimic View)
    # Decode UID
    try:
        uid_decoded = force_str(urlsafe_base64_decode(uid_encoded))
        user_view = User.objects.get(pk=uid_decoded)
        print(f"User found in view: {user_view.email}")
    except Exception as e:
        print(f"Error finding user: {e}")
        return

    is_valid = default_token_generator.check_token(user_view, token)
    print(f"Token Valid? {is_valid}")
    
    if is_valid:
        print("SUCCESS: Token flow works correctly.")
    else:
        print("FAILURE: Token is invalid immediately.")
        print(f"Expected token now: {default_token_generator.make_token(user_view)}")
        
    # 4. Simulate State Change (e.g. if Serializer saves again?)
    # ... currently serializer does not seem to save again after task (task is in atomic block? no, after)
    
test_token_flow()
