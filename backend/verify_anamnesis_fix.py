import os
import django
import sys

# Setup Django
sys.path.append('C:\\Nutri 4.0\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from anamnesis.models import Anamnesis
from rest_framework.test import APIRequestFactory
from anamnesis.views import AnamnesisViewSet
from django.contrib.auth import get_user_model

User = get_user_model()

def verify_fix():
    print("--- Verification Start ---")
    
    # Target User ID 33
    user_id = 33
    user = User.objects.filter(id=user_id).first()
    if not user:
        print(f"Error: User {user_id} not found.")
        return

    profile = PatientProfile.objects.filter(user_id=user_id).first()
    if not profile:
        print(f"Error: Profile for User {user_id} not found.")
        return
    
    profile_id = profile.id
    print(f"User {user_id} maps to Profile {profile_id}")

    # Simulate Request
    factory = APIRequestFactory()
    data = {
        'patient': user_id,
        'nome': 'Test Verification',
        'objetivo': 'Emagrecimento'
    }
    
    # We use create method directly or via viewset
    view = AnamnesisViewSet.as_view({'post': 'create'})
    request = factory.post('/api/v1/anamnesis/standard/', data, format='json')
    # No auth needed for this endpoint as per get_permissions in views.py
    
    response = view(request)
    print(f"Response Status: {response.status_code}")
    print(f"Response Data: {response.data}")

    if response.status_code in [200, 201]:
        print("SUCCESS: Backend correctly handled User ID.")
        
        # Verify database
        anamnesis = Anamnesis.objects.filter(patient_id=profile_id).first()
        if anamnesis:
            print(f"Database Record Found for Profile {profile_id}: {anamnesis.nome}")
            if anamnesis.nome == 'Test Verification':
                print("DATABASE VERIFIED: Record updated correctly.")
            else:
                print("DATABASE WARNING: Name mismatch, but record exists.")
        else:
            print("DATABASE ERROR: No record found for the profile after success response.")
    else:
        print("FAILURE: Backend returned error.")

if __name__ == "__main__":
    verify_fix()
