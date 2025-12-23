import os
import django
import sys

# Adiciona o diretório do projeto ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configura o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
try:
    django.setup()
except Exception as e:
    print(f"Erro ao configurar o Django: {e}")
    print("Verifique se você está no diretório 'backend' e com o ambiente virtual ativado.")
    sys.exit(1)

from django.contrib.auth import get_user_model

User = get_user_model()

def check_user_status():
    """
    Verifica o status de um usuário no banco de dados.
    """
    email = input("Por favor, digite o e-mail que você usa para fazer login: ").strip()
    
    if not email:
        print("\nNenhum e-mail fornecido. Saindo.")
        return

    print(f"\nProcurando pelo usuário com o e-mail: {email}...")

    try:
        user = User.objects.get(email=email)
        print("\n--- STATUS DA CONTA ---")
        print(f"[✓] Usuário encontrado: {user.name} (ID: {user.id})")
        
        if user.is_active:
            print("[✓] Status da conta: ATIVO")
        else:
            print("[X] Status da conta: INATIVO")
            print("   -> Causa provável: A conta foi desativada.")

        if hasattr(user, 'patient_profile'):
             print(f"[i] Tipo de conta: Paciente (associado ao nutricionista: {user.patient_profile.nutritionist.name})")
        elif user.user_type == 'nutricionista':
             print("[i] Tipo de conta: Nutricionista")
        else:
             print("[?] Tipo de conta: Desconhecido")

        print("\nDiagnóstico: A conta existe e está ativa. Se o login ainda falha, o problema é quase certamente a senha incorreta.")

    except User.DoesNotExist:
        print("\n--- STATUS DA CONTA ---")
        print("[X] Usuário NÃO encontrado.")
        print("   -> Causa provável: O e-mail digitado está incorreto ou a conta não existe no banco de dados atual.")
    except Exception as e:
        print(f"\nOcorreu um erro inesperado: {e}")

if __name__ == "__main__":
    check_user_status()
