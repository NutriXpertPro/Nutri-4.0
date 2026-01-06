
import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

print("Iniciando setup do Django...")
try:
    django.setup()
    print("Django setup concluído.")
except Exception as e:
    print(f"Erro no setup do Django: {e}")
    sys.exit(1)

from patients.serializers import PatientProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

User = get_user_model()
factory = APIRequestFactory()

def test_repro():
    print("Iniciando teste de reprodução...")
    # Encontrar um nutricionista para o contexto
    nutri = User.objects.filter(user_type='nutricionista').first()
    if not nutri:
        print("Erro: Nenhum nutricionista encontrado no banco.")
        return

    # Dados que o frontend envia
    payload = {
        "name": "Paciente Teste 400",
        "email": f"teste_sync_{os.getpid()}@exemplo.com",
        "gender": "F",
        "phone": "(11) 99999-9999",
        "address": "Rua Teste",
        "goal": "PERDA_GORDURA",
        "service_type": "ONLINE",
        "start_date": "2025-01-01",
        "birth_date": "1990-01-01"
    }

    print(f"Payload de teste: {payload}")

    # Simular requisição para ter o contexto
    request = factory.post('/api/patients/', payload)
    request.user = nutri

    serializer = PatientProfileSerializer(data=payload, context={'request': request})
    
    print("Validando serializer...")
    if serializer.is_valid():
        print("Serializer is VALID")
        try:
            print("Chamando serializer.save()...")
            patient = serializer.save()
            print(f"Sucesso: Paciente {patient.id} criado.")
        except Exception as e:
            print(f"ERRO NO SAVE(): {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("Serializer INVALID!")
        print(f"Erros: {serializer.errors}")

if __name__ == "__main__":
    try:
        test_repro()
    except Exception as e:
        print(f"Erro fatal no script: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("--- SCRIPT FINALIZADO ---")
