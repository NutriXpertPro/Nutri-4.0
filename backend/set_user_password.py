import os
import django
import sys

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model

def set_user_password(email, new_password):
    User = get_user_model()
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        print(f"SUCESSO: Senha do usuario {email} atualizada para: {new_password}")
    except User.DoesNotExist:
        print(f"ERRO: Usuario com email {email} nao encontrado.")
    except Exception as e:
        print(f"ERRO inesperado: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python set_user_password.py <email> <senha>")
    else:
        email_arg = sys.argv[1]
        password_arg = sys.argv[2]
        set_user_password(email_arg, password_arg)
