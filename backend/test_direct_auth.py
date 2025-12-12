import os
import django

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
# Adicionar o diretório do projeto ao sys.path para que o django.setup() funcione
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import authenticate

print("--- Iniciando Teste de Autenticação Direta ---")

# Credenciais a serem testadas
email_to_test = "andersoncarlosvp@gmail.com"
password_to_test = "12345678"

print(f"Tentando autenticar o usuário: {email_to_test}")

# Chamar a função de autenticação principal do Django
user = authenticate(email=email_to_test, password=password_to_test)

# Verificar o resultado
if user is not None:
    print("\n--- RESULTADO ---")
    print("✅ SUCESSO: A autenticação no backend foi bem-sucedida.")
    print(f"Usuário autenticado: {user.email}")
    print(f"Tipo de usuário: {user.user_type}")
    print("O backend está funcionando corretamente. O problema provavelmente está no frontend.")
else:
    print("\n--- RESULTADO ---")
    print("❌ FALHA: A autenticação no backend falhou.")
    print("Mesmo com o script de atualização de senha, o Django não conseguiu autenticar o usuário.")
    print("Isso aponta para um problema mais complexo na configuração de autenticação do Django (settings.py).")

print("\n--- Teste Concluído ---")
