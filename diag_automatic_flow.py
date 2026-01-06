
import os
import django
import sys
import time

# Setup logging to file
log_file = open("diag_flow.log", "w", encoding='utf-8')
def log(msg):
    print(msg)
    log_file.write(msg + "\n")
    log_file.flush()

log("--- INICIANDO SCRIPT DE DIAGNOSTICO ---")

try:
    # Setup Django
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
    log("Chamando django.setup()...")
    django.setup()
    log("django.setup() concluido.")

    from django.contrib.auth import get_user_model
    from patients.serializers import PatientProfileSerializer
    from rest_framework.test import APIRequestFactory
    from django.conf import settings
    log("Importacoes concluidas.")

    User = get_user_model()

    def run_diagnostic():
        log("--- EXECUÇÃO DO DIAGNÓSTICO ---")
        
        # 1. Obter Nutricionista
        nutri_email = "andersoncarlosvp@gmail.com"
        nutritionist = User.objects.filter(email=nutri_email).first()
        if not nutritionist:
            log(f"ERRO: Nutricionista {nutri_email} nao encontrado.")
            return
        
        log(f"Nutricionista encontrado: {nutritionist.email}")

        # 2. Dados do Paciente
        test_email = "anderson_28vp@hotmail.com"
        patient_data = {
            'name': 'Teste Diagnostico Robusto',
            'email': test_email,
            'gender': 'M',
            'birth_date': '1990-01-01',
            'goal': 'PERDA_GORDURA',
            'service_type': 'ONLINE'
        }
        
        # 3. Mock Request
        factory = APIRequestFactory()
        request = factory.post('/api/patients/')
        request.user = nutritionist
        
        log(f"Pronto para salvar serializer para {test_email}...")
        serializer = PatientProfileSerializer(data=patient_data, context={'request': request})
        
        if serializer.is_valid():
            log("Dados validos. Chamando serializer.save()...")
            # Redirecionar stdout/stderr internos para o nosso log para pegar os [DEBUG EMAIL]
            old_stdout = sys.stdout
            sys.stdout = log_file 
            try:
                profile = serializer.save()
                sys.stdout = old_stdout
                log(f"SUCESSO: Perfil ID {profile.id} salvo.")
            except Exception as e:
                sys.stdout = old_stdout
                log(f"ERRO CRITICO NO SAVE: {type(e).__name__}: {e}")
        else:
            log(f"ERRO DE VALIDACAO: {serializer.errors}")

    run_diagnostic()

except Exception as e:
    log(f"FALHA GERAL NO SCRIPT: {type(e).__name__}: {e}")
finally:
    log("--- FIM DO SCRIPT ---")
    log_file.close()

# Imprimir o log no final para o run_command capturar
if os.path.exists("diag_flow.log"):
    with open("diag_flow.log", "r", encoding='utf-8') as f:
        print(f.read())
