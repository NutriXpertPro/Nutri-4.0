import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

# Criar usuário nutricionista de teste
email = 'andersoncarlosvp@gmail.com'
password = '12345678'
name = 'Anderson Carlos'

try:
    # Verificar se o usuário já existe
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        user.set_password(password)
        user.user_type = 'nutricionista'
        user.name = name
        user.is_active = True
        user.save()
        print(f"Usuário nutricionista {email} atualizado com sucesso!")
    else:
        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            user_type='nutricionista'
        )
        user.is_active = True
        user.save()
        print(f"Usuário nutricionista {email} criado com sucesso!")

    print(f"Email: {email}")
    print(f"Senha: {password}")
    print(f"Nome: {user.name}")
    print(f"Tipo: {user.user_type}")
    print(f"ID: {user.id}")

except Exception as e:
    print(f"Erro ao criar/atualizar usuário: {e}")