import os
import sys
import django

# Adiciona o diretório do projeto ao caminho do Python
sys.path.append(os.path.join(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

django.setup()

from users.models import User

def check_users():
    print("Verificando usuários cadastrados...")

    # Verifica todos os usuários
    users = User.objects.all()
    print(f"Total de usuários: {users.count()}")

    for user in users:
        print(f"ID: {user.id}, Email: {user.email}, Tipo: {user.user_type}, Nome: {user.name}")

    # Verifica apenas nutricionistas
    nutritionists = User.objects.filter(user_type='nutricionista')
    print(f"\nNutricionistas: {nutritionists.count()}")

    for nutritionist in nutritionists:
        print(f"ID: {nutritionist.id}, Email: {nutritionist.email}, Nome: {nutritionist.name}, Título: {nutritionist.professional_title}")

if __name__ == "__main__":
    check_users()