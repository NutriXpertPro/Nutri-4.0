from django.contrib.auth import get_user_model

User = get_user_model()

email = 'andersoncarlosvp@gmail.com'
password = '900113Acps@'

try:
    user = User.objects.get(email=email)
    print(f'User found: {user.email} (Type: {user.user_type})')
    user.set_password(password)
    user.is_active = True
    user.user_type = 'nutricionista'
    user.save()
    print(f'Password updated successfully for {email}')
except User.DoesNotExist:
    print(f'User {email} not found. Creating...')
    user = User.objects.create_user(
        email=email,
        password=password,
        name='Anderson Carlos',
        user_type='nutricionista'
    )
    print(f'User {email} created successfully with provided password.')
except Exception as e:
    print(f'Error: {e}')
