#!/usr/bin/env python
"""Script para verificar e corrigir o acesso do nutricionista"""

import os
import sys
import django
from django.contrib.auth.hashers import make_password

# Adiciona o diretório do projeto ao caminho do Python
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Configura o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from users.models import User

def main():
    print("=== Correção de Acesso do Nutricionista ===")
    
    # Dados do usuário
    email = 'andersoncarlosvp@gmail.com'
    password = '900113Acps@'
    name = 'Anderson Carlos'
    
    print(f"Procurando usuário com email: {email}")
    
    try:
        # Tenta encontrar o usuário existente
        user = User.objects.filter(email=email).first()
        
        if user:
            print(f"Usuário encontrado: {user.email}")
            print(f"Nome atual: {user.name or 'Não definido'}")
            print(f"Tipo de usuário: {user.user_type or 'Não definido'}")
            print(f"Status ativo: {user.is_active}")
            
            # Atualiza as informações
            user.name = name
            user.user_type = 'nutricionista'
            user.is_active = True
            user.password = make_password(password)
            
            user.save()
            print("\nUsuário atualizado com sucesso!")
        else:
            # Cria um novo usuário
            user = User.objects.create_user(
                email=email,
                password=password,
                name=name,
                user_type='nutricionista',
                is_active=True
            )
            print(f"\nUsuário criado com sucesso!")
        
        print(f"\nInformações do usuário:")
        print(f"  Email: {user.email}")
        print(f"  Nome: {user.name}")
        print(f"  Tipo: {user.user_type}")
        print(f"  Ativo: {user.is_active}")
        print(f"  ID: {user.id}")
        
        # Testa a senha
        if user.check_password(password):
            print(f"\n✓ Senha verificada com sucesso!")
            print(f"Senha fornecida: {password}")
            print("Agora você pode fazer login com as credenciais:")
            print(f"  Email: {email}")
            print(f"  Senha: {password}")
        else:
            print(f"\n✗ Erro ao verificar a senha!")
            
    except Exception as e:
        print(f"Erro ao processar o usuário: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()