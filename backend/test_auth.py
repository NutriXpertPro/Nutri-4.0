import os
import django

# Configurar o ambiente Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

from django.contrib.auth import authenticate
from users.models import User

def test_authentication():
    print("=== Testando Autenticação ===")
    
    # Obter todos os nutricionistas cadastrados
    nutritionists = User.objects.filter(user_type='nutricionista')
    print(f"Encontrados {nutritionists.count()} nutricionistas:")
    
    for user in nutritionists:
        print(f"- Email: {user.email}, Nome: {user.name}, Ativo: {user.is_active}")
    
    if nutritionists.exists():
        # Testar autenticação com o primeiro usuário
        first_user = nutritionists.first()
        print(f"\nTestando autenticação para: {first_user.email}")
        
        # Testar com uma senha incorreta
        auth_result = authenticate(username=first_user.email, password="senha_incorreta")
        print(f"Autenticação com senha errada: {'SUCESSO' if auth_result else 'FALHA'}")
        
        # Se houver um usuário de teste, você pode testar com uma senha real
        print("Lembre-se de testar com a senha real do usuário!")
    else:
        print("\nNenhum nutricionista encontrado no banco de dados.")

if __name__ == "__main__":
    test_authentication()