import os
import django
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User
from rest_framework.test import APIRequestFactory
from patients.serializers import PatientProfileSerializer

def create_patient_test_2():
    # Encontrar o nutricionista
    nutri = User.objects.get(email='andersoncarlosvp@gmail.com')

    # Simular o contexto do request
    factory = APIRequestFactory()
    request = factory.post('/api/patients/')
    request.user = nutri

    # Dados para o paciente "Paciente Teste 2"
    data = {
        'name': 'Paciente Teste 2',
        'email': 'paciente.teste2@example.com',  # Usando um email diferente
        'gender': 'F',
        'birth_date': '1990-01-01',
        'goal': 'PERDA_PESO',
        'service_type': 'ONLINE'
    }

    serializer = PatientProfileSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        try:
            with transaction.atomic():
                patient = serializer.save()
                print(f"Sucesso ao criar paciente: {patient.user.name} (ID: {patient.id})")
        except Exception as e:
            import traceback
            print("ERRO DETECTADO:")
            traceback.print_exc()
    else:
        print("Dados inválidos:")
        print(serializer.errors)

if __name__ == "__main__":
    create_patient_test_2()