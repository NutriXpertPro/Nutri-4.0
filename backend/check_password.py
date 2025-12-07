import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import CustomUser

try:
    user = CustomUser.objects.get(email='test@test.com')
    print(f'User: {user.name}')
    print(f'Email: {user.email}')
    print(f'User type: {user.user_type}')
    print(f'Is active: {user.is_active}')
    print(f'Has usable password: {user.has_usable_password()}')
    print(f'Check password "test": {user.check_password("test")}')
    print(f'Check password "Test@123": {user.check_password("Test@123")}')
    print(f'Check password "Mudar@123": {user.check_password("Mudar@123")}')
except CustomUser.DoesNotExist:
    print('User not found!')
