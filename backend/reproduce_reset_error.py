
import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from patients.serializers import PatientProfileSerializer
from users.models import UserProfile
from django.test import RequestFactory
import secrets
import string

User = get_user_model()

def run_test():
    print("--- Starting Reproduction Test ---")
    
    # 1. Create a dummy nutritionist (for context)
    nutri_email = f"nutri_{secrets.token_hex(4)}@example.com"
    nutri = User.objects.create_user(email=nutri_email, password="password123", name="Nutri Testers", user_type='nutricionista')
    print(f"Created Nutritionist: {nutri.email}")

    # 2. Simulate Patient Creation via Serializer
    patient_email = f"patient_{secrets.token_hex(4)}@example.com"
    patient_data = {
        'name': 'Patient Test',
        'email': patient_email,
        'gender': 'M',
        'birth_date': '1990-01-01',
        'phone': '123456789',
        # ... other fields ignored for now
    }

    # Context with mock request
    factory = RequestFactory()
    request = factory.get('/')
    request.user = nutri
    
    serializer = PatientProfileSerializer(data=patient_data, context={'request': request})
    if serializer.is_valid():
        print("Serializer is valid. Saving...")
        patient_profile = serializer.save() # This triggers the atomic block, user creation, signal, and task queuing (if eager)
        patient_user = patient_profile.user
        print(f"Created Patient User: {patient_user.email} (ID: {patient_user.id})")
        print(f"Patient Password Hash (initial): {patient_user.password}")
    else:
        print("Serializer Error:", serializer.errors)
        return

    # 3. Simulate Task Token Generation
    # Reload user to match what task does
    task_user = User.objects.get(pk=patient_user.pk)
    
    token = default_token_generator.make_token(task_user)
    uidb64 = urlsafe_base64_encode(force_bytes(task_user.pk))
    
    print(f"Generated Token: {token}")
    print(f"Generated UIDb64: {uidb64}")
    
    # 4. Simulate Password Reset Verification (as View does)
    # Decode UID
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        view_user = User.objects.get(pk=uid)
    except Exception as e:
        print(f"UID Decoding Error: {e}")
        return

    print(f"View User Loaded: {view_user.email}")
    print(f"View User Password Hash: {view_user.password}")
    
    # Check Token
    is_valid = default_token_generator.check_token(view_user, token)
    print(f"Only User, Is Token Valid? {is_valid}")

    if is_valid:
        print("SUCCESS: Token verification passed.")
    else:
        print("FAILURE: Token verification failed.")
        
        # Debugging why
        # Create a new token now and compare
        new_token = default_token_generator.make_token(view_user)
        print(f"New Token generated now: {new_token}")
        if token != new_token:
            print("Token mismatch! Something changed in the user state.")
            
            # Compare state fields
            print(f"Task User last_login: {task_user.last_login}")
            print(f"View User last_login: {view_user.last_login}")
            print(f"Task User password: {task_user.password}")
            print(f"View User password: {view_user.password}")

run_test()
