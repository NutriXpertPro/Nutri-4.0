import os
import django

# Configurar o ambiente Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")
django.setup()

print("Configurações do Django carregadas com sucesso!")
print("Testando conexão com o banco de dados...")

from django.db import connection

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
    print("Conexão com o banco de dados bem-sucedida!")
except Exception as e:
    print(f"Erro na conexão com o banco de dados: {e}")

# Testar importação do backend de autenticação
try:
    from users.authentication import EmailBackend
    print("Backend de autenticação personalizado importado com sucesso!")
except Exception as e:
    print(f"Erro ao importar backend de autenticação: {e}")

# Testar importação do modelo User
try:
    from users.models import User
    print("Modelo User importado com sucesso!")
except Exception as e:
    print(f"Erro ao importar modelo User: {e}")
    
print("Testes básicos concluídos.")