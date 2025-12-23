import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from django.contrib.auth import get_user_model

User = get_user_model()

# Buscar o nutricionista
try:
    nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
    print(f'✓ Nutricionista encontrado: {nutri.name} (ID: {nutri.id})')
    print()
except User.DoesNotExist:
    print('✗ Nutricionista não encontrado!')
    exit(1)

# Buscar TODOS os pacientes (incluindo inativos)
print('=== TODOS OS PACIENTES NO BANCO (ativos e inativos) ===')
all_patients = PatientProfile.objects.filter(nutritionist=nutri)
print(f'Total: {all_patients.count()} pacientes')
print()

for p in all_patients:
    status_icon = '✓' if p.is_active else '✗'
    status_text = 'ATIVO' if p.is_active else 'INATIVO'
    print(f'{status_icon} ID {p.id}: {p.user.name}')
    print(f'   Email: {p.user.email}')
    print(f'   Status: {status_text}')
    print()

# Buscar pacientes inativos especificamente
inactive = PatientProfile.objects.filter(nutritionist=nutri, is_active=False)
if inactive.exists():
    print(f'⚠️  ATENÇÃO: {inactive.count()} paciente(s) INATIVO(S) encontrado(s)!')
    print()
    
    # Perguntar se deve reativar
    print('Os seguintes pacientes estão inativos:')
    for p in inactive:
        print(f'  - {p.user.name} ({p.user.email})')
    
    print()
    print('Reativando TODOS os pacientes inativos...')
    
    count = 0
    for p in inactive:
        p.is_active = True
        p.save()
        count += 1
        print(f'  ✓ {p.user.name} reativado')
    
    print()
    print(f'✅ {count} paciente(s) reativado(s) com sucesso!')
else:
    print('✓ Todos os pacientes estão ativos.')

print()
print('=== PACIENTES ATIVOS AGORA ===')
active_now = PatientProfile.objects.filter(nutritionist=nutri, is_active=True)
print(f'Total de pacientes ativos: {active_now.count()}')
for p in active_now:
    print(f'  ✓ {p.user.name} ({p.user.email})')
