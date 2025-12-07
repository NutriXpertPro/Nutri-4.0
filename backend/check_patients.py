from django.contrib.auth import get_user_model
from patients.models import PatientProfile

User = get_user_model()

# Buscar o nutricionista logado
nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
print(f'Nutricionista logado:')
print(f'  ID: {nutri.id}')
print(f'  Nome: {nutri.name}')
print(f'  Email: {nutri.email}')
print(f'  Tipo: {nutri.user_type}')
print()

# Buscar todos os pacientes
print('Pacientes no banco:')
for p in PatientProfile.objects.all():
    print(f'  Paciente ID {p.id}: {p.user.name}')
    print(f'    Nutricionista ID: {p.nutritionist.id}')
    print(f'    Nutricionista: {p.nutritionist.name} ({p.nutritionist.email})')
    print()

# Verificar se há match
print('Análise:')
pacientes_do_nutri = PatientProfile.objects.filter(nutritionist=nutri)
print(f'  Pacientes associados a {nutri.email}: {pacientes_do_nutri.count()}')
