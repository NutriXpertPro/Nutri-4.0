import requests
import datetime
import json
import os
import django
from django.conf import settings

# Configurar Django para usar os models se necessário, mas aqui vamos testar via HTTP (como o frontend)
# URL base da API
BASE_URL = 'http://localhost:8000/api/v1'

def run_test():
    print("--- Iniciando Teste de Diagnóstico de Agendamento (PATCH) ---")
    
    # 1. Autenticação (Login)
    # Assumindo credenciais padrão de teste ou admin
    email = "nutri@teste.com" # Ajuste conforme necessário
    password = "senha_segura_123" # Ajuste conforme necessário
    
    print(f"1. Tentando login com {email}...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login/nutricionista/", json={
            "email": email,
            "password": password
        })
        
        if response.status_code != 200:
            print(f"   [FALHA] Login falhou: {response.status_code} - {response.text}")
            # Tentar criar usuário de teste se login falhar? 
            # Por enquanto, vamos assumir que o usuário do setup inicial existe
            return
            
        data = response.json()
        access_token = data.get('access') or data.get('token') # Ajuste conforme resposta da API
        if not access_token:
            # Se a estrutura for diferente
            access_token = data.get('access_token')
            
        print("   [SUCESSO] Login realizado.")
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
    except Exception as e:
        print(f"   [ERRO] Exceção ao tentar login: {e}")
        return

    # 2. Listar Pacientes (para pegar um ID válido)
    print("\n2. Buscando paciente para vincular...")
    try:
        response = requests.get(f"{BASE_URL}/patients/", headers=headers)
        patients = response.json()
        if not patients or (isinstance(patients, dict) and 'results' in patients and not patients['results']):
             print("   [AVISO] Nenhum paciente encontrado. Tentando criar agendamento sem paciente (vai falhar) ou abortar.")
             # Se não tiver paciente, não dá pra agendar
             return
             
        # Pegar o primeiro paciente
        if isinstance(patients, dict) and 'results' in patients:
            patient_id = patients['results'][0]['id']
        else:
            patient_id = patients[0]['id']
            
        print(f"   [SUCESSO] Paciente ID {patient_id} selecionado.")
        
    except Exception as e:
        print(f"   [ERRO] Falha ao buscar pacientes: {e}")
        return

    # 3. Criar Agendamento de Teste
    print("\n3. Criando agendamento de teste...")
    # Data para amanhã às 10:00
    tomorrow = datetime.datetime.now() + datetime.timedelta(days=1)
    tomorrow = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
    
    payload = {
        "patient_id": patient_id, # O serializer espera patient_id ou patient? Vamos testar
        "date": tomorrow.isoformat(),
        "duration": 60,
        "type": "teste",
        "status": "agendada"
    }
    
    # Nota: O serializer pode esperar 'patient' (ID) em vez de 'patient_id'
    # Vamos tentar com 'patient' se 'patient_id' falhar, ou enviar ambos no payload inicial
    payload_create = payload.copy()
    payload_create['patient'] = patient_id
    
    try:
        response = requests.post(f"{BASE_URL}/appointments/", json=payload_create, headers=headers)
        
        if response.status_code != 201:
            print(f"   [FALHA] Criação falhou: {response.status_code} - {response.text}")
            return
            
        appointment = response.json()
        appt_id = appointment['id']
        print(f"   [SUCESSO] Agendamento criado: ID {appt_id} para {appointment['date']}")
        
    except Exception as e:
        print(f"   [ERRO] Exceção na criação: {e}")
        return

    # 4. Testar PATCH (Mover Agendamento)
    print(f"\n4. Testando PATCH para mover agendamento {appt_id}...")
    
    # Mover para 2 horas depois
    new_date = tomorrow + datetime.timedelta(hours=2)
    patch_payload = {
        "date": new_date.isoformat()
    }
    
    print(f"   Enviando PATCH para nova data: {new_date.isoformat()}")
    
    try:
        response = requests.patch(f"{BASE_URL}/appointments/{appt_id}/", json=patch_payload, headers=headers)
        
        if response.status_code == 200:
            updated_appt = response.json()
            print(f"   [SUCESSO] PATCH retornou 200 OK.")
            print(f"   Data original: {appointment['date']}")
            print(f"   Nova data retornada: {updated_appt['date']}")
            
            # Verificar se persistiu
            if updated_appt['date'] == new_date.isoformat().replace('+00:00', 'Z') or \
               updated_appt['date'].startswith(new_date.isoformat().split('+')[0]): # Comparação básica
                print("   [CONFIRMAÇÃO] Data atualizada corretamente!")
            else:
                print("   [ATENÇÃO] Data retornada difere da enviada (pode ser fuso horário).")
        else:
            print(f"   [FALHA] PATCH falhou: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"   [ERRO] Exceção no PATCH: {e}")

    # 5. Limpeza (Opcional - Deletar agendamento de teste)
    print("\n5. Limpeza...")
    requests.delete(f"{BASE_URL}/appointments/{appt_id}/", headers=headers)
    print("   Agendamento de teste removido.")

if __name__ == "__main__":
    run_test()
