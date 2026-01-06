
import os
import sys
import django
import traceback

# Adiciona o diretório backend ao path
sys.path.append('.')
os.chdir('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

try:
    django.setup()
    from django.conf import settings
    from patients.tasks import send_welcome_email_task
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    # Pega um usuário qualquer que seja paciente para testar
    user_id = 33 
    
    print(f"--- Tentando executar a task para o user_id {user_id} ---")
    try:
        # Chamando a função diretamente (não o .delay) para ver o erro aqui
        # send_welcome_email_task(user_id, "Nutricionista Teste")
        # Na verdade, se ALWAYS_EAGER=True, .delay() também chamaria aqui.
        # Mas vamos chamar a função diretamente para garantir que capturamos o erro.
        
        # Precisamos de um objeto 'self' se for bind=True? 
        # send_welcome_email_task.run(user_id, "Nutricionista Teste")
        
        # Vamos usar o .apply que é mais limpo para testes
        result = send_welcome_email_task.apply(args=[user_id, "Nutricionista Teste"])
        
        if result.failed():
            print("A tarefa FALHOU!")
            print(f"Exception: {result.result}")
            print(f"Traceback: {result.traceback}")
        else:
            print(f"A tarefa retornou: {result.result}")
            
    except Exception as e:
        print("Erro ao tentar executar a tarefa:")
        traceback.print_exc()
        
except Exception as e:
    print(f"ERRO DE SETUP: {e}")
