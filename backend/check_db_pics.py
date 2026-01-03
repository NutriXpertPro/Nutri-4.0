import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from users.models import User, UserProfile
from patients.models import PatientProfile

print("--- Nutricionistas (Users with profile pictures) ---")
users = User.objects.filter(email='andersoncarlosvp@gmail.com')
for user in users:
    has_profile = hasattr(user, 'profile')
    pic = user.profile.profile_picture if has_profile else "No Profile"
    print(f"User: {user.email}, Name: {user.name}, ProfilePic: {pic}")

print("\n--- Pacientes (Patient Profiles) ---")
patients = PatientProfile.objects.all()[:5]
for p in patients:
    has_user_profile = hasattr(p.user, 'profile')
    pic = p.user.profile.profile_picture if has_user_profile else "No User Profile"
    print(f"Patient: {p.user.name}, Email: {p.user.email}, ProfilePic: {pic}")
