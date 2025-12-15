import os
import sys

# Adicionando o diretório do projeto ao path
sys.path.append(r'C:\Nutri 4.0\backend')

# Configurando o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
import django
django.setup()

# Importando os modelos e serializers
from django.test import RequestFactory
from users.views import UserDetailView
from django.contrib.auth import get_user_model
from rest_framework.test import force_authenticate
from rest_framework.request import Request
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

# Criando um usuário de teste
def test_user_api():
    # Criar um usuário de teste
    user = User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        name='Test User',
        user_type='nutricionista'
    )
    
    # Criar uma requisição fake
    factory = RequestFactory()
    request = factory.get('/users/me/')
    
    # Autenticar o usuário
    force_authenticate(request, user=user)
    
    # Converter para DRF Request
    drf_request = Request(request)
    
    # Criar uma instância da view
    view = UserDetailView.as_view()
    
    # Criar response
    response = view(drf_request)
    response.render()
    
    print("Status Code:", response.status_code)
    print("Response Data:", response.data)
    
    # Limpar
    user.delete()

if __name__ == '__main__':
    test_user_api()