#!/usr/bin/env python
"""Reset password for nutritionist user"""
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
    # Find nutritionist user
    user = User.objects.filter(user_type='nutritionist').first()
    
    if not user:
        print('ERROR: Nenhum nutricionista encontrado!')
        sys.exit(1)
    
    print(f'Encontrado usuário: {user.name} ({user.email})')
    print(f'Tipo de usuário: {user.user_type}')
    print(f'Ativo: {user.is_active}')
    
    # Set new password
    new_password = '12345678'
    user.set_password(new_password)
    user.save()
    
    print(f'\n✅ Senha alterada para: {new_password}')
    print(f'Verificação: {user.check_password(new_password)}')
    
except Exception as e:
    print(f'ERRO: {e}')
