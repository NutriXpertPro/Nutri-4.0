print("Iniciando script...")

import requests
print("Biblioteca requests importada!")

# SUBSTITUA pela sua API key
API_KEY = "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"
print(f"API Key configurada: {API_KEY[:20]}...")

def conversar(mensagem):
    print(f"\n[DEBUG] Enviando mensagem: {mensagem}")
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    dados = {
        "model": "openai/gpt-oss-20b:free",
        "messages": [{"role": "user", "content": mensagem}]
    }
    
    try:
        print("[DEBUG] Fazendo requisição...")
        resposta = requests.post(url, headers=headers, json=dados, timeout=30)
        print(f"[DEBUG] Status code: {resposta.status_code}")
        resposta.raise_for_status()
        resultado = resposta.json()
        print("[DEBUG] Resposta recebida!")
        return resultado['choices'][0]['message']['content']
    except Exception as erro:
        print(f"[ERRO] {type(erro).__name__}: {erro}")
        return f"Erro: {erro}"

print("\n=== Chat GPT-OSS-20B ===")
print("Digite 'sair' para encerrar\n")

while True:
    try:
        pergunta = input("Voce: ")
        if pergunta.lower() in ['sair', 'exit']:
            print("Encerrando...")
            break
        print("\nProcessando...")
        resposta = conversar(pergunta)
        print(f"\nBot: {resposta}\n")
    except KeyboardInterrupt:
        print("\n\nInterrompido pelo usuário")
        break
    except Exception as e:
        print(f"\n[ERRO GERAL] {e}")