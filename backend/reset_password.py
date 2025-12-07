#!/usr/bin/env python
"""Reset password for test user"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

try:
    user = User.objects.get(email='test@test.com')
    print(f'Found user: {user.name} ({user.email})')
    print(f'User type: {user.user_type}')
    print(f'Is active: {user.is_active}')
    
    # Set new password
    new_password = 'test'
    user.set_password(new_password)
    user.save()
    
    print(f'\nPassword changed to: {new_password}')
    print(f'Verification: {user.check_password(new_password)}')
    
except User.DoesNotExist:
    print('ERROR: User not found!')
