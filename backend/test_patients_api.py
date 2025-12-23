import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Buscar o nutricionista
nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
print(f'✓ Nutricionista: {nutri.name}')

# Gerar token JWT
refresh = RefreshToken.for_user(nutri)
access_token = str(refresh.access_token)
print(f'✓ Token JWT gerado')
print()

# Fazer requisição à API
url = 'http://localhost:8000/api/patients/'
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json'
}

print(f'Fazendo requisição GET para: {url}')
print(f'Headers: Authorization: Bearer {access_token[:20]}...')
print()

try:
    response = requests.get(url, headers=headers)
    print(f'Status Code: {response.status_code}')
    print()
    
    if response.status_code == 200:
        data = response.json()
        print(f'Tipo de resposta: {type(data)}')
        
        # Se for paginado
        if isinstance(data, dict) and 'results' in data:
            patients = data['results']
            print(f'Total de pacientes (paginado): {data.get("count", len(patients))}')
        else:
            patients = data
            print(f'Total de pacientes: {len(patients)}')
        
        print()
        print('=== PACIENTES RETORNADOS PELA API ===')
        for p in patients:
            print(f'ID: {p.get("id")}')
            print(f'Nome: {p.get("name")}')
            print(f'Email: {p.get("email")}')
            print(f'Status: {p.get("status")}')
            print()
    else:
        print(f'Erro: {response.status_code}')
        print(response.text)
        
except Exception as e:
    print(f'Erro ao fazer requisição: {e}')
