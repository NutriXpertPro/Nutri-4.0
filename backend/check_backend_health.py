
import requests
import sys

URL = "http://localhost:8000/api/v1/notifications/"

print(f"Testando conexão com: {URL}")

try:
    # Tenta conectar com um timeout curto
    response = requests.get(URL, timeout=5)
    
    print(f"Status Code: {response.status_code}")
    print(f"Resposta:\n{response.text[:200]}...") # Primeiros 200 chars
    
    if response.status_code == 403:
        print("\n[OK] Conexão bem sucedida (403 Forbidden é esperado sem token). O servidor está online.")
        sys.exit(0)
    elif response.status_code == 401:
        print("\n[OK] Conexão bem sucedida (401 Unauthorized é esperado sem token). O servidor está online.")
        sys.exit(0)
    elif response.status_code == 200:
        print("\n[OK] Conexão bem sucedida (200 OK). O servidor está online e acessível.")
        sys.exit(0)
    else:
        print(f"\n[ALERTA] Servidor respondeu com código inesperado: {response.status_code}")
        sys.exit(1)

except requests.exceptions.ConnectionError:
    print("\n[ERRO] FALHA DE CONEXÃO: Não foi possível conectar ao servidor.")
    print("Possíveis causas:")
    print("1. O backend não está rodando.")
    print("2. O backend está rodando em outra porta (não 8000).")
    print("3. Bloqueio de firewall.")
    sys.exit(1)
except Exception as e:
    print(f"\n[ERRO] Erro inesperado: {e}")
    sys.exit(1)
