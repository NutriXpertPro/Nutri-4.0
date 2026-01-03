import os
import django
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from patients.models import PatientProfile
from users.models import User
from rest_framework.test import APIRequestFactory
from patients.serializers import PatientProfileSerializer

def reproduce():
    nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
    
    # Simular o contexto do request
    factory = APIRequestFactory()
    request = factory.post('/api/patients/')
    request.user = nutri
    
    data = {
        'name': 'Angela Teste',
        'email': 'portes.angela09@gmail.com', # O e-mail que foi deletado
        'gender': 'F',
        'birth_date': '1980-01-01',
        'goal': 'PERDA_GORDURA',
        'service_type': 'ONLINE'
    }
    
    serializer = PatientProfileSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        try:
            with transaction.atomic():
                patient = serializer.save()
                print(f"Sucesso ao criar paciente: {patient.id}")
        except Exception as e:
            import traceback
            print("ERRO DETECTADO:")
            traceback.print_exc()
    else:
        print("Dados inválidos:")
        print(serializer.errors)

if __name__ == "__main__":
    reproduce()
