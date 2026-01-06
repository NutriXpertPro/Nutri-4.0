
import os
import django
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

email = 'anderson_28vp@hotmail.com'
user = User.objects.filter(email=email).first()

if user:
    print(f"USER_EXISTS: True")
    print(f"USER_ID: {user.id}")
    print(f"HAS_PROFILE: {hasattr(user, 'patient_profile')}")
else:
    print("USER_EXISTS: False")
