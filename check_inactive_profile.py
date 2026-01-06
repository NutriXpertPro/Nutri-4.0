
import os
import django
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import PatientProfile

User = get_user_model()

email = 'anderson_28vp@hotmail.com'
user = User.objects.filter(email=email).first()

if user:
    print(f"USER_EXISTS: True")
    profile = PatientProfile.objects.filter(user=user).first()
    if profile:
        print(f"PROFILE_EXISTS: True")
        print(f"PROFILE_ID: {profile.id}")
        print(f"PROFILE_IS_ACTIVE: {profile.is_active}")
        print(f"NUTRITIONIST_ID: {profile.nutritionist_id}")
    else:
        print("PROFILE_EXISTS: False")
else:
    print("USER_EXISTS: False")
