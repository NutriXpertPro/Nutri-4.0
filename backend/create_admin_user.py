import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Seu email
email = 'anderson_28vp@hotmail.com'
password = 'SuaSenhaSegura123!'  # Altere esta senha
name = 'Anderson'

if not User.objects.filter(email=email).exists():
    # Criar usuário administrador
    admin_user = User.objects.create_superuser(email=email, password=password, name=name)
    print(f"Admin user {email} created successfully")
    print(f"Email: {email}")
    print(f"Password: {password}")
else:
    # Atualizar usuário existente para ser administrador
    user = User.objects.get(email=email)
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    print(f"User {email} updated to admin status")
    print(f"Email: {email}")
    print(f"Password: {password}")