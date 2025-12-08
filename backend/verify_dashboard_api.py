import os
import django
import requests
import sys
import pymysql
pymysql.install_as_MySQLdb()

# Setup Django to check DB
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from django.contrib.auth import get_user_model
from patients.models import PatientProfile
from appointments.models import Appointment
from django.utils import timezone

User = get_user_model()

# 1. Ensure Test User Exists
email = "nutri_test_api@example.com"
password = "TestPassword123!"

try:
    user, created = User.objects.get_or_create(email=email, defaults={
        "name": "Nutri Test API",
        "user_type": "nutricionista"
    })
    user.set_password(password)
    user.save()
    print(f"User {email} ready.")
except Exception as e:
    print(f"Error creating user: {e}")
    sys.exit(1)

# 2. Login via API
login_url = "http://localhost:8000/api/v1/auth/login/"
try:
    print(f"Attempting login at {login_url}...")
    resp = requests.post(login_url, json={"email": email, "password": password})
except requests.exceptions.ConnectionError:
    print("Error: Could not connect to server at http://localhost:8000. Make sure the server is running.")
    sys.exit(1)

if resp.status_code != 200:
    print("Login failed:", resp.status_code, resp.text)
    sys.exit(1)

data = resp.json()
if "tokens" in data:
    token = data["tokens"]["access"]
elif "access" in data:
    token = data["access"]
else:
    print("Unknown token format:", data)
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}"}
print("Logged in. Token obtained.")

# 3. Test Dashboard Stats
print("\nTesting Stats...")
resp = requests.get("http://localhost:8000/api/v1/dashboard/stats/", headers=headers)
print("Stats Code:", resp.status_code)
print("Stats Data:", resp.json())

# 4. Test Appointments Today
print("\nTesting Appointments Today...")
resp = requests.get("http://localhost:8000/api/v1/dashboard/appointments/today/", headers=headers)
print("Appointments Code:", resp.status_code)
print("Appointments Data:", resp.json())

# 5. Test Featured Patient
print("\nTesting Featured Patient...")
resp = requests.get("http://localhost:8000/api/v1/dashboard/patients/featured/", headers=headers)
print("Featured Code:", resp.status_code)
print("Featured Data:", resp.json())
