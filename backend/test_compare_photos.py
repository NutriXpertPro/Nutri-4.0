import os
import sys

# Adicionando o diretório do projeto ao path
sys.path.append(r'C:\Nutri 4.0\backend')

# Configurando o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
import django
django.setup()

from django.test import RequestFactory
from django.contrib.auth import get_user_model
from patients.models import PatientProfile
from patients.views import compare_photos_view
from rest_framework.test import APIRequestFactory
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser

def test_compare_photos_api():
    print("Testando API de comparação de fotos...")
    
    User = get_user_model()
    
    # Obter o usuário admin (ID 1)
    try:
        user = User.objects.get(id=1)  # Supondo que o usuário admin tenha ID 1
        print(f"Usuário encontrado: {user.email}")
        
        # Criar paciente para testar
        patient, created = PatientProfile.objects.get_or_create(
            user_id=2,  # Supondo que exista um paciente com ID 2
            nutritionist=user,
            defaults={'is_active': True}
        )
        print(f"Paciente {'criado' if created else 'encontrado'}: {patient.user.name if patient.user else 'Unknown'}")
        
        # Criar uma requisição fake
        factory = APIRequestFactory()
        request = factory.get(f'/patients/{patient.pk}/compare_photos/')
        
        # Adicionar o usuário autenticado
        request.user = user
        
        # Chamar a view
        response = compare_photos_view(request, patient.pk)
        response.render()
        
        print("Status Code:", response.status_code)
        print("Response Data:", response.data)
        
        if response.status_code == 200:
            print("✓ API compare_photos funcionando corretamente")
        elif response.status_code == 404:
            print("✓ API retornou 404 corretamente (sem avaliações)")
        else:
            print(f"✗ Erro na API: {response.data}")
        
    except User.DoesNotExist:
        print("Usuário com ID 1 não encontrado")
    except PatientProfile.DoesNotExist:
        print("Paciente com ID 2 não encontrado")
    except Exception as e:
        print(f"Erro ao testar API: {str(e)}")

if __name__ == '__main__':
    test_compare_photos_api()