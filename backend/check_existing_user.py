import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

email = 'andersoncarlosvp@gmail.com'

try:
    user = User.objects.get(email=email)
    print(f"Usuario encontrado:")
    print(f"  Email: {user.email}")
    print(f"  Nome: {user.name}")
    print(f"  Tipo: {user.user_type}")
    print(f"  ID: {user.id}")
    print(f"  Ativo: {user.is_active}")
    print(f"  Staff: {user.is_staff}")
    print(f"  Superuser: {user.is_superuser}")

    # Verificar se a senha está correta (nao podemos ver a senha em texto claro)
    print(f"\nTentando autenticar com a senha fornecida...")
    from django.contrib.auth import authenticate

    authenticated_user = authenticate(email=email, password='12345678')
    if authenticated_user:
        print("SUCESSO: Autenticacao bem-sucedida!")
    else:
        print("ERRO: Credenciais invalidas")

except User.DoesNotExist:
    print(f"ERRO: Usuario com email {email} nao encontrado")
except Exception as e:
    print(f"ERRO: Erro ao verificar usuario: {e}")