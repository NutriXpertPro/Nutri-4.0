from django.contrib.auth import get_user_model
from patients.models import PatientProfile

User = get_user_model()

# Buscar o nutricionista correto
nutri_correto = User.objects.get(email='andersoncarlosvp@gmail.com')
print(f'Nutricionista destino: {nutri_correto.name} (ID: {nutri_correto.id})')

# Atualizar todos os pacientes
pacientes_atualizados = 0
for p in PatientProfile.objects.all():
    print(f'Atualizando paciente: {p.user.name}')
    print(f'  De: Nutricionista ID {p.nutritionist.id} ({p.nutritionist.name})')
    print(f'  Para: Nutricionista ID {nutri_correto.id} ({nutri_correto.name})')
    
    p.nutritionist = nutri_correto
    p.save()
    pacientes_atualizados += 1

print(f'\n✅ {pacientes_atualizados} paciente(s) reasociado(s) com sucesso!')

# Verificar
print('\nVerificação:')
pacientes_do_nutri = PatientProfile.objects.filter(nutritionist=nutri_correto)
print(f'Total de pacientes de {nutri_correto.email}: {pacientes_do_nutri.count()}')
for p in pacientes_do_nutri:
    print(f'  - {p.user.name} ({p.user.email})')
