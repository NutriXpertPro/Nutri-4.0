import os
import django

# Configurar o ambiente Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from django.contrib.auth import get_user_model
from users.models import User

def fix_user_login():
    print("=== Corrigindo Problemas de Login ===")
    
    email = "andersoncarlosvp@gmail.com"
    password = "12345678"
    
    try:
        # Tenta encontrar o usuário
        user = User.objects.get(email=email)
        print(f"✅ Usuário encontrado: {user.email}")
        print(f"Tipo de usuário: {user.user_type}")
        print(f"Status ativo: {user.is_active}")
        print(f"Data de criação: {user.created_at}")
        
        # Verificar se é nutricionista
        if user.user_type != 'nutricionista':
            print(f"⚠️  Tipo de usuário incorreto. Atualizando de '{user.user_type}' para 'nutricionista'")
            user.user_type = 'nutricionista'
            user.save()
            print("✅ Tipo de usuário atualizado para 'nutricionista'")
        else:
            print("✅ Tipo de usuário está correto")
        
        # Verificar se está ativo
        if not user.is_active:
            print("⚠️  Usuário está inativo. Ativando conta...")
            user.is_active = True
            user.save()
            print("✅ Usuário ativado")
        else:
            print("✅ Usuário já está ativo")
        
        # Redefinir a senha
        print("🔄 Redefinindo senha para '12345678'...")
        user.set_password(password)
        user.save()
        print("✅ Senha redefinida com sucesso")
        
        # Testar autenticação
        from django.contrib.auth import authenticate
        auth_result = authenticate(request=None, username=email, password=password)
        
        if auth_result:
            print(f"✅ Autenticação bem-sucedida! Usuário: {auth_result.email}")
            print(f"Tipo: {auth_result.user_type}")
        else:
            print("❌ Falha na autenticação mesmo após correções")
            
    except User.DoesNotExist:
        print(f"❌ Usuário com email {email} NÃO encontrado no banco de dados.")
        print("Criando novo usuário nutricionista...")
        
        user = User.objects.create_user(
            email=email,
            password=password,
            name="Anderson Carlos",  # Nome padrão, pode ser personalizado
            user_type='nutricionista',
            is_active=True
        )
        print(f"✅ Usuário criado com sucesso: {user.email}")
        print(f"Tipo: {user.user_type}")
        print(f"Status ativo: {user.is_active}")
        
        # Testar autenticação
        from django.contrib.auth import authenticate
        auth_result = authenticate(request=None, username=email, password=password)
        
        if auth_result:
            print(f"✅ Autenticação bem-sucedida! Usuário: {auth_result.email}")
        else:
            print("❌ Falha na autenticação mesmo após criação do usuário")
    
    except Exception as e:
        print(f"❌ Erro durante a correção: {e}")

if __name__ == "__main__":
    fix_user_login()