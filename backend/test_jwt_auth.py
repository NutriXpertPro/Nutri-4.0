import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.serializers import CustomTokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

User = get_user_model()

# Testar se o serializer funciona corretamente
print("Testando o serializer CustomTokenObtainPair...")

try:
    # Testar autenticação direta primeiro
    user = authenticate(email='andersoncarlosvp@gmail.com', password='12345678')
    if user:
        print(f"SUCESSO: Autenticacao direta bem-sucedida para {user.email}")
        print(f"Tipo de usuario: {user.user_type}")

        if user.user_type == 'nutricionista':
            # Testar geração de tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            print(f"SUCESSO: Tokens JWT gerados com sucesso!")
            print(f"Access Token: {access_token[:50]}...")
        else:
            print(f"AVISO: Usuario nao e nutricionista, e {user.user_type}")
            print("O CustomTokenObtainPairSerializer restringe a nutricionistas")
    else:
        print("ERRO: Autenticacao direta falhou")

    # Testar a validação do serializer com contexto apropriado
    factory = APIRequestFactory()
    request = factory.post('/api/v1/auth/token/', {
        'email': 'andersoncarlosvp@gmail.com',
        'password': '12345678'
    })

    serializer = CustomTokenObtainPairSerializer(data={
        'username': 'andersoncarlosvp@gmail.com',  # O serializer mapeia email para username
        'password': '12345678'
    })
    serializer.context = {'request': request}

    if serializer.is_valid():
        print("SUCESSO: Validacao do serializer bem-sucedida")

        # Obter o usuário para verificar o tipo
        user = User.objects.get(email='andersoncarlosvp@gmail.com')
        if user.user_type != 'nutricionista':
            print(f"ERRO: Validacao falhou por tipo de usuario incorreto: {user.user_type}")
        else:
            print("SUCESSO: Todos os testes passaram!")
    else:
        print(f"ERRO: Erro na validacao do serializer: {serializer.errors}")

except User.DoesNotExist:
    print("ERRO: Usuario nao encontrado")
except Exception as e:
    print(f"ERRO: Erro ao testar o serializer: {e}")
    import traceback
    traceback.print_exc()