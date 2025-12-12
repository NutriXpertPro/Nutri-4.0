import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

email = 'andersoncarlosvp@gmail.com'

try:
    user = User.objects.get(email=email)
    print(f"Resetando a senha do usuário {user.email}...")
    
    # Redefinir a senha
    user.set_password('12345678')
    user.save()
    
    print(f"Senha redefinida com sucesso para o usuário {user.email}")
    
    # Testar novamente a autenticação
    from django.contrib.auth import authenticate
    
    authenticated_user = authenticate(email=email, password='12345678')
    if authenticated_user:
        print("Autenticação bem-sucedida após reset!")
    else:
        print("Autenticação ainda falhou após reset")
        
except User.DoesNotExist:
    print(f"Usuário com email {email} não encontrado")
except Exception as e:
    print(f"Erro ao resetar senha: {e}")