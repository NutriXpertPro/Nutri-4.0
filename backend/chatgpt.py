print("Script iniciado!")

import requests

# SUBSTITUA pela sua nova API key do OpenRouter
API_KEY = "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"

def conversar(mensagem):
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
        resposta = requests.post(url, headers=headers, json=dados, timeout=30)
        resposta.raise_for_status()
        resultado = resposta.json()
        return resultado['choices'][0]['message']['content']
    except Exception as erro:
        return f"Erro: {erro}"

print("\n=== Chat GPT-OSS-20B ===")
print("Digite 'sair' para encerrar\n")

while True:
    pergunta = input("Voce: ")
    if pergunta.lower() in ['sair', 'exit']:
        print("Encerrando...")
        break
    print("\nProcessando...")
    resposta = conversar(pergunta)
    print(f"\nBot: {resposta}\n")