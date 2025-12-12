import requests
import json

# Testar o endpoint JWT diretamente
BASE_URL = "http://localhost:8000"

login_data = {
    "email": "andersoncarlosvp@gmail.com",
    "password": "12345678"
}

try:
    print("Tentando fazer login via endpoint JWT...")
    response = requests.post(f"{BASE_URL}/api/v1/auth/token/", 
                           data=login_data,
                           headers={'Content-Type': 'application/json'})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        tokens = response.json()
        print("Login bem-sucedido!")
        print(f"Access token: {tokens.get('access', '')[:50]}...")
    else:
        print("Login falhou")
        
except requests.exceptions.ConnectionError:
    print("Não foi possível conectar ao servidor. Verifique se está rodando na porta 8000")
except Exception as e:
    print(f"Erro: {e}")