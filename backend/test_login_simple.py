import os
import django

# Configurar o ambiente Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from django.contrib.auth import authenticate
from users.models import User

def test_authentication_with_user():
    print("=== Testando Autenticacao com Usuario Existentes ===")
    
    # Obter o nutricionista cadastrado
    nutritionist = User.objects.filter(user_type='nutricionista').first()
    
    if nutritionist:
        print(f"Usuario encontrado: {nutritionist.email}")
        
        # Testar autenticação com a senha real (como no arquivo check_user.py)
        password = "12345678"  # Senha definida no script check_user.py
        auth_result = authenticate(request=None, username=nutritionist.email, password=password)
        
        if auth_result:
            print(f"SUCESSO: Autenticacao bem-sucedida para: {nutritionist.email}")
            print(f"Tipo de usuario: {auth_result.user_type}")
        else:
            print(f"FALHA: Autenticacao falhou para: {nutritionist.email}")
            print("Possiveis causas:")
            print("- Senha incorreta")
            print("- Problemas com os backends de autenticacao")
            print("- Usuario inativo")
    else:
        print("Nenhum nutricionista encontrado no banco de dados.")

if __name__ == "__main__":
    test_authentication_with_user()