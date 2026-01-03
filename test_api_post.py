
import requests
import json
import random

# Configuration
BASE_URL = 'http://localhost:8001/api/v1'
LOGIN_URL = f'{BASE_URL}/token/'
PATIENTS_URL = f'{BASE_URL}/patients/'

# Credentials
EMAIL = 'andersoncarlosvp@gmail.com'
PASSWORD = 'your_password_here' # We need to get the token first. 
# Since we don't know the password (it's hashed), we can generate a token via script or use a known one.
# But wait, runserver is running. We can use a script to generate a token for the user.

import os
import django
import sys

# Setup Django to get a valid token
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
user = User.objects.get(email=EMAIL)
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f"Token obtido: {access_token[:20]}...")

# Data to send
rand_id = random.randint(10000, 99999)
payload = {
    'name': f'Paciente Via API {rand_id}',
    'email': f'api_test_{rand_id}@teste.com',
    'phone': '(11) 98888-7777',
    'birth_date': '1995-05-05',
    'gender': 'F',
    'goal': 'GANHO_MASSA',
    'service_type': 'PRESENCIAL',
    'start_date': '2025-02-01'
}

headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

print(f"Enviando POST para {PATIENTS_URL}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(PATIENTS_URL, json=payload, headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    if response.status_code >= 400:
        if 'application/json' in response.headers.get('Content-Type', ''):
             print(f"Response JSON: {json.dumps(response.json(), indent=2)}")
        else:
             # Tentar extrair o titulo do erro do HTML
             try:
                 from bs4 import BeautifulSoup
                 soup = BeautifulSoup(response.text, 'html.parser')
                 title = soup.title.string.strip() if soup.title else "No Title"
                 exception_value = soup.find(class_="exception_value")
                 exception_msg = exception_value.string.strip() if exception_value else "No excepiton value found"
                 print(f"Error Title: {title}")
                 print(f"Exception Message: {exception_msg}")
             except ImportError:
                 print("BeautifulSoup not installed, printing first 500 chars:")
                 print(f"Response Text: {response.text[:500]}")
             except Exception as e:
                 print(f"Error parsing HTML: {e}")
                 print(f"Response Text: {response.text[:500]}")

    else:
        print(f"Response JSON: {json.dumps(response.json(), indent=2)}")

except Exception as e:
    print(f"Erro na requisição: {e}")
