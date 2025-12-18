from ollama_cloud_config import OllamaCloudConfig

def perguntar_ia(pergunta, modelo='qwen3-coder:480b'):
    ollama = OllamaCloudConfig()
    messages = [{'role': 'user', 'content': pergunta}]
    resposta = ollama.chat_with_model(
        model=modelo,
        messages=messages,
        stream=False
    )
    return resposta.message.content

# Exemplo de uso
resultado = perguntar_ia('Dê 3 dicas para emagrecer saudavelmente')
print(resultado)