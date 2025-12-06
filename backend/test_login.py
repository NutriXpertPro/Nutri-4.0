import os
import django

# Configurar o ambiente Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from django.contrib.auth import authenticate
from users.models import User

def test_authentication_with_user():
    print("=== Testando Autenticação com Usuário Existentes ===")
    
    # Obter o nutricionista cadastrado
    nutritionist = User.objects.filter(user_type='nutricionista').first()
    
    if nutritionist:
        print(f"Usuário encontrado: {nutritionist.email}")
        
        # Testar autenticação com a senha real (como no arquivo check_user.py)
        password = "12345678"  # Senha definida no script check_user.py
        auth_result = authenticate(request=None, username=nutritionist.email, password=password)
        
        if auth_result:
            print(f"✅ Autenticação bem-sucedida para: {nutritionist.email}")
            print(f"Tipo de usuário: {auth_result.user_type}")
        else:
            print(f"❌ Falha na autenticação para: {nutritionist.email}")
            print("Possíveis causas:")
            print("- Senha incorreta")
            print("- Problemas com os backends de autenticação")
            print("- Usuário inativo")
    else:
        print("Nenhum nutricionista encontrado no banco de dados.")

if __name__ == "__main__":
    test_authentication_with_user()