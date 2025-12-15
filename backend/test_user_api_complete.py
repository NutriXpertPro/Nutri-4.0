import os
import sys

# Adicionando o diretório do projeto ao path
sys.path.append(r'C:\Nutri 4.0\backend')

# Configurando o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
import django
django.setup()

# Adicionar testserver ao ALLOWED_HOSTS temporariamente para testes
from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def test_user_api():
    print("Testando API de usuário...")

    # Criar um cliente de teste
    client = Client()

    # Criar um usuário de teste com email único
    import uuid
    email = f'test_{uuid.uuid4()}@example.com'

    user = User.objects.create_user(
        email=email,
        password='testpass123',
        name='Test User',
        user_type='nutricionista',
        professional_title='Dr.',
        gender='M'
    )

    # Primeiro, obter tokens JWT
    login_response = client.post('/api/token/', {
        'email': email,
        'password': 'testpass123'
    }, content_type='application/json')

    if login_response.status_code != 200:
        print(f"✗ Falha ao obter tokens JWT: {login_response.content}")
        return

    tokens = json.loads(login_response.content)
    access_token = tokens['access']

    # Testar GET /api/v1/auth/me/
    print("\n1. Testando GET /api/v1/auth/me/...")
    client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
    response = client.get('/api/v1/auth/me/')

    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✓ GET /api/v1/auth/me/ funcionando corretamente")
        data = json.loads(response.content)
        print(f"Dados retornados: {dict(list(data.items())[:3])}...")  # Mostrar primeiros 3 campos
    else:
        print(f"✗ Erro no GET /api/v1/auth/me/: {response.content}")

    # Testar PATCH /api/v1/auth/me/
    print("\n2. Testando PATCH /api/v1/auth/me/...")
    response_patch = client.patch('/api/v1/auth/me/',
                                  json.dumps({'name': 'Updated Test User'}),
                                  content_type='application/json')

    if response_patch.status_code == 200:
        print("✓ PATCH /api/v1/auth/me/ funcionando corretamente")
        data = json.loads(response_patch.content)
        print(f"Nome atualizado para: {data.get('name')}")
    else:
        print(f"✗ Erro no PATCH /api/v1/auth/me/: {response_patch.content}")

    # Testar POST /api/v1/auth/me/change-password/
    print("\n3. Testando POST /api/v1/auth/me/change-password/...")
    response_change_pass = client.post('/api/v1/auth/me/change-password/', {
        'old_password': 'testpass123',
        'new_password': 'NewPass456!',
        'confirm_new_password': 'NewPass456!'
    }, content_type='application/json')

    if response_change_pass.status_code == 200:
        print("✓ POST /api/v1/auth/me/change-password/ funcionando corretamente")
        data = json.loads(response_change_pass.content)
        print(f"Resposta: {data}")
    else:
        print(f"✗ Erro no POST /api/v1/auth/me/change-password/: {response_change_pass.content}")

    # Limpar
    user.delete()
    print("\n✓ Todos os testes de API concluídos!")

if __name__ == '__main__':
    test_user_api()