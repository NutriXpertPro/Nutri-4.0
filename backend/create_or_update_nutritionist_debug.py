import os
import sys
import django
from django.contrib.auth.hashers import make_password

# Adiciona o diretório do projeto ao caminho do Python
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Configurando o ambiente Django...")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

print("Django configurado com sucesso!")

from users.models import User

def create_or_update_nutritionist():
    email = 'andersoncarlosvp@gmail.com'
    password = '900113Acps@'  # Senha correta conforme solicitado
    name = 'Anderson Carlos'
    
    print(f"Tentando encontrar ou criar usuário com email: {email}")
    
    try:
        # Verificar se o usuário já existe
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'user_type': 'nutricionista',
                'is_active': True
            }
        )
        
        if created:
            print(f"Usuário nutricionista {email} criado com sucesso!")
        else:
            print(f"Usuário nutricionista {email} encontrado, atualizando informações...")
            
        # Atualizar a senha independentemente de ser novo ou existente
        user.password = make_password(password)
        user.user_type = 'nutricionista'
        user.is_active = True
        user.name = name
        
        user.save()
        
        print(f"Usuário atualizado com sucesso!")
        print(f"Email: {user.email}")
        print(f"Nome: {user.name}")
        print(f"Tipo: {user.user_type}")
        print(f"Ativo: {user.is_active}")
        print(f"ID: {user.id}")
        
        # Verificar se a senha foi definida corretamente
        print(f"Senha definida: {'Sim' if user.password else 'Não'}")
        
        # Testar se a senha está correta
        is_correct = user.check_password(password)
        print(f"Senha correta: {is_correct}")
        
    except Exception as e:
        print(f"Erro ao criar/atualizar usuário: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_or_update_nutritionist()