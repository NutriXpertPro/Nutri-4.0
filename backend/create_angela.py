import os
import django
import sys
import html

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from patients.serializers import PatientProfileSerializer

User = get_user_model()

def create_patient_angela():
    print("--- Criando Paciente Angela para Verificação do Usuário ---")
    
    try:
        # 1. Get Nutritionist
        nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
        print(f"Nutricionista: {nutri.name} ({nutri.email})")

        # 2. Data
        raw_name = "Angela Cristina Portes de Sant'Ana"
        print(f"Nome Original: {raw_name}")
        
        data = {
            'name': raw_name,
            'email': 'angelacristina@example.com',
            'phone': '(11) 99999-9999',
            'goal': 'PERDA_PESO',
            'gender': 'F',
            'service_type': 'ONLINE',
            'start_date': '2025-01-01'
        }

        # Mock Request
        factory = APIRequestFactory()
        request = factory.post('/api/patients/', data)
        request.user = nutri

        # Initialize Serializer
        serializer = PatientProfileSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            patient = serializer.save()
            final_name = patient.user.name
            print(f"PACIENTE CRIADO COM SUCESSO!")
            print(f"Nome no Banco: '{final_name}'")
            
            if "Sant'Ana" in final_name and "&" not in final_name:
                print("STATUS: SUCESSO - Nome gravado corretamente.")
            else:
                print("STATUS: FALHA - Nome gravado incorretamente.")
                
        else:
            print(f"Erro de validação: {serializer.errors}")

    except Exception as e:
        print(f"Erro Fatal: {e}")

if __name__ == "__main__":
    create_patient_angela()
