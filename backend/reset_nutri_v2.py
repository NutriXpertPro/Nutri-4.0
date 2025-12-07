import os
import sys

# 1. Configurar o patch do PyMySQL ANTES de qualquer import do Django
import pymysql
pymysql.install_as_MySQLdb()

# Monkey patch crucial para Django aceitar o PyMySQL como se fosse o client nativo
try:
    import MySQLdb
    # Mentir sobre a versão do MySQLdb para o Django não reclamar
    MySQLdb.version_info = (2, 2, 1, 'final', 0)
    MySQLdb.__version__ = '2.2.1' 
except ImportError:
    pass

# 2. Configurar o ambiente Django
# Adicionar o diretório atual ao path para encontrar os módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

def reset_password():
    User = get_user_model()
    try:
        users = User.objects.all()
        print(f"Total users found: {users.count()}")
        for u in users:
            print(f"User: {u.email} | Name: {u.name} | Type: {u.user_type} | ID: {u.id}")
            
        user = User.objects.filter(email='nutri@email.com').first() # Tenta um email comum ou pega pelo ID depois
        if not user:
             user = User.objects.filter(is_superuser=True).first() # Fallback para admin
             
        if user:
            print(f"Resetting password for: {user.email} (Type: {user.user_type})")
            user.set_password('12345678')
            user.save()
            print(f"SUCCESS: Senha alterada para o usuário {user.email}")
        else:
            print("ERROR: Nenhum usuário encontrado para resetar.")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == '__main__':
    reset_password()
