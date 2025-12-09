import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

username = 'test_dev'
email = 'test_dev@example.com'
password = 'TestPassword123!'

if not User.objects.filter(username=username).exists():
    User.objects.create_user(username=username, email=email, password=password)
    print(f"User {username} created")
else:
    u = User.objects.get(username=username)
    u.set_password(password)
    u.save()
    print(f"User {username} password reset")
