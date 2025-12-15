import os
import sys
import django

# Adicionar o diretório do projeto ao path
sys.path.append(r'C:\Nutri 4.0\backend')

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

# Configurar o django
django.setup()

from users.models import User

# Verificar usuários existentes
users = User.objects.all()
print('Total de usuários:', users.count())

print("\nListando todos os usuários:")
for user in users:
    print(f'ID: {user.id}, Email: {user.email}, Ativo: {user.is_active}')

# Verificar se o usuário específico existe
try:
    specific_user = User.objects.get(email='andersoncarlosvp@gmail.com')
    print(f"\nUsuário encontrado com email 'andersoncarlosvp@gmail.com':")
    print(f'ID: {specific_user.id}, Email: {specific_user.email}, Ativo: {specific_user.is_active}')
    print(f'Senha definida: {specific_user.has_usable_password()}')
except User.DoesNotExist:
    print(f"\nNenhum usuário encontrado com email 'andersoncarlosvp@gmail.com'")