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

def verify_encoding_fix():
    print("--- Verificando Correção de Encoding de Nome ---")
    
    try:
        # 1. Get Nutritionist
        nutri = User.objects.get(email='andersoncarlosvp@gmail.com')
        print(f"Nutricionista: {nutri.name} ({nutri.email})")

        # 2. Test Cases covering different escaped scenarios
        p1_name = "Angela Cristina Portes de Sant'Ana"
        p2_name = "Angela Cristina Portes de Sant&#x27;Ana" 
        p3_name = "Angela Cristina Portes de Sant&amp;#x27;Ana"

        test_names = [p1_name, p2_name, p3_name]
        
        for i, raw_input_name in enumerate(test_names):
            print(f"\nTeste #{i+1}: Input = '{raw_input_name}'")
            
            # Simulated Data
            data = {
                'name': raw_input_name,
                'email': f'test_angela_{i}@verification.com',
                'phone': '11999999999',
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
                # Check validated data BEFORE saving (it should already be unescaped by our fix)
                validated_name = serializer.validated_data['user']['name']
                print(f"  > Validated Name (no serializer): '{validated_name}'")
                
                # Check clean flow
                # Our fix is in start of create(), so we need to call save() to trigger it?
                # Actually, our fix is in create() method of serializer, so let's call save()
                # Use a transaction atomic roll back to not pollute DB? 
                # Or just let it create and check. I'll create to be sure.
                try:
                    patient = serializer.save()
                    saved_name = patient.user.name
                    print(f"  > Saved Name in DB: '{saved_name}'")
                    
                    expected = "Angela Cristina Portes De Sant'Ana" # .title() applies capitalization
                    # Note: "de" might become "De" with .title() which is acceptable/expected behavior of standard django title()
                    # We are focusing on data corruption (&#x27;) vs correct char (')
                    
                    if "Sant'Ana" in saved_name and "&" not in saved_name:
                        print("  > [PASS] Nome salvo corretamente com apóstrofo e sem HTML entities.")
                    else:
                        print(f"  > [FAIL] Nome salvo incorreto: {saved_name}")
                        
                    # Cleanup
                    patient.user.delete()
                    
                except Exception as e:
                    print(f"  > Erro ao salvar: {e}")
            else:
                print(f"  > Erro de validação: {serializer.errors}")

    except Exception as e:
        print(f"Erro Fatal: {e}")

if __name__ == "__main__":
    verify_encoding_fix()
