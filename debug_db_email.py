
import os
import django
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.contrib.auth import get_user_model
    from patients.models import PatientProfile
    
    User = get_user_model()
    email = 'anderson_28vp@hotmail.com'
    
    print(f"Buscando email: {email}")
    users = User.objects.filter(email=email)
    print(f"Total de usuários encontrados: {users.count()}")
    
    for user in users:
        print(f"User ID: {user.id}, Nome: {user.name}, Tipo: {user.user_type}, Ativo: {user.is_active}")
        profiles = PatientProfile.objects.filter(user=user)
        print(f"  Perfis encontrados: {profiles.count()}")
        for p in profiles:
            print(f"  Profile ID: {p.id}, Ativo: {p.is_active}, Nutricionista: {p.nutritionist.email}")

except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
