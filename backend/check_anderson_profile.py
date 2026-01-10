
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from users.models import User
from patients.models import PatientProfile

print("--- Checking All 'Anderson' Users ---")
users = User.objects.filter(name__icontains='Anderson')

for u in users:
    print(f"\nUser: {u.name} (ID: {u.id})")
    print(f"  Type: {u.user_type}")
    print(f"  Email: {u.email}")
    
    # Check patient profile
    try:
        profile = u.patient_profile
        print(f"  [OK] Has PatientProfile (ID: {profile.id})")
        print(f"       Nutritionist: {profile.nutritionist.name if profile.nutritionist else 'None'}")
    except Exception as e:
        print(f"  [MISSING] No PatientProfile: {e}")

    # Check nutritionist profile (if applicable)
    if u.user_type == 'nutritionist':
        # Assuming there might be a profile or just the user type
        pass
