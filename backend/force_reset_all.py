import os
import sys

# Setup completo do Django
import pymysql
pymysql.install_as_MySQLdb()

try:
    import MySQLdb
    MySQLdb.version_info = (2, 2, 1, 'final', 0)
    MySQLdb.__version__ = '2.2.1' 
except ImportError:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model

def fix_all_passwords():
    User = get_user_model()
    users = User.objects.all()
    
    print("\n" + "="*50)
    print("RELATÓRIO DE CREDENCIAIS (SENHAS RESETADAS)")
    print("="*50)
    
    if not users.exists():
        print("❌ NENHUM USUÁRIO ENCONTRADO NO BANCO DE DADOS!")
        return

    for user in users:
        old_pass_check = user.check_password('12345678')
        
        # Força o reset independente de qualquer coisa
        user.set_password('12345678')
        user.save()
        
        print(f"\n👤 Usuário: {user.name}")
        print(f"📧 Email (Login): {user.email}")
        print(f"🔑 Senha definida para: 12345678")
        print(f"🏷️  Tipo: {user.user_type}")
        print(f"🆔 ID: {user.id}")
        print("-" * 30)

    print("\n✅ TODAS AS SENHAS FORAM DEFINIDAS PARA: 12345678")
    print("Tente fazer login com um dos emails listados acima.")

if __name__ == '__main__':
    fix_all_passwords()
