
import os
import django
import sys

# Setup deve vir ANTES de qualquer import que use models
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from patients.views import PatientListView
from patients.serializers import PatientProfileSerializer

User = get_user_model()

try:
    # Get Nutri
    nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
    print(f"Nutricionista encontrado: {nutri.email}")

    # Prepare data for new patient
    # Using a random email to avoid uniqueness constraint in repeated runs
    import random
    rand_id = random.randint(1000, 9999)
    patient_data = {
        'name': f'Paciente Teste {rand_id}',
        'email': f'paciente{rand_id}@teste.com',
        'phone': '11999999999',
        'birth_date': '1990-01-01',
        'gender': 'M',
        'goal': 'PERDA_PESO',
        'service_type': 'ONLINE',
        'start_date': '2025-01-01'
    }

    print(f"Tentando criar paciente: {patient_data}")

    # Test Serializer directly first
    print("\n--- Testando Serializer Direto ---")
    # Mock request context
    factory = APIRequestFactory()
    request = factory.post('/api/v1/patients/', patient_data, format='json')
    request.user = nutri
    
    serializer = PatientProfileSerializer(data=patient_data, context={'request': request})
    if serializer.is_valid():
        print("Serializer Válido!")
        try:
            patient = serializer.save()
            print(f"Paciente criado com sucesso via Serializer: {patient.id}")
        except Exception as e:
            print(f"ERRO ao salvar via Serializer: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"Serializer Inválido: {serializer.errors}")

except Exception as e:
    print(f"Erro Geral no Script: {e}")
    import traceback
    traceback.print_exc()
