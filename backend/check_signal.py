
import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

# Configure Celery to run tasks synchronously for testing
settings.CELERY_TASK_ALWAYS_EAGER = True
settings.CELERY_TASK_EAGER_PROPAGATES = True

from django.contrib.auth import get_user_model
from patients.models import PatientProfile
from users.models import UserProfile
import secrets
import string

User = get_user_model()

def test_signal_email():
    print("--- Starting Signal Email Test ---")
    
    # 1. Create Dietitian (Nutritionist)
    nutri_email = f"nutri_{secrets.token_hex(4)}@example.com"
    nutri = User.objects.create_user(
        email=nutri_email,
        name="Nutri Debug",
        user_type="nutricionista",
        password="password123"
    )
    print(f"Nutritionist created: {nutri_email}")

    # 2. Create Patient User
    patient_email = f"patient_{secrets.token_hex(4)}@example.com"
    patient = User.objects.create_user(
        email=patient_email,
        name="Patient Debug",
        user_type="paciente",
        password="password123"
    )
    print(f"Patient created: {patient_email}")
    
    # 3. Create PatientProfile (Should trigger Signal -> Email Task)
    print("Creating PatientProfile (expecting Email Task output below)...")
    try:
        profile = PatientProfile.objects.create(
            user=patient,
            nutritionist=nutri
        )
        print("PatientProfile created.")
    except Exception as e:
        print(f"Error creating PatientProfile: {e}")

    print("--- End Signal Email Test ---")

if __name__ == '__main__':
    test_signal_email()
