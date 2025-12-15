import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'test_dev' # Mantido apenas para referencia se necessario, mas nao usado no filtro
email = 'test_dev@example.com'
password = 'TestPassword123!'
name = 'Test Developer'

if not User.objects.filter(email=email).exists():
    User.objects.create_user(email=email, password=password, name=name, user_type='nutricionista')
    print(f"User {email} created")
else:
    u = User.objects.get(email=email)
    u.set_password(password)
    u.save()
    print(f"User {email} password reset")
