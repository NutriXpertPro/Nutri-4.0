# Guia de Implementação: Integração com Ollama Cloud

Este guia descreve como integrar a API do Ollama Cloud ao projeto Nutri 4.0.

## Configuração Inicial

1. **Obter uma chave de API do Ollama Cloud**:
   - Acesse [ollama.com](https://ollama.com) e crie uma conta
   - Gere uma chave de API na seção de configurações

2. **Instalar dependências**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configurar variáveis de ambiente**:
   - Adicione sua chave de API ao arquivo `.env`:
     ```
     OLLAMA_API_KEY=sua_chave_de_api_aqui
     ```

## Arquivos Implementados

1. **`ollama_cloud_config.py`**: Classe principal para interação com a API do Ollama Cloud
2. **`test_ollama_connection.py`**: Script para testar a conexão com a API
3. **`.env`**: Arquivo para armazenar variáveis de ambiente (já criado com estrutura básica)

## Funcionalidades Disponíveis

- Autenticação com a API do Ollama Cloud
- Listagem de modelos disponíveis
- Interações com streaming
- Modo de pensamento (reasoning)
- Saída estruturada em JSON

## Exemplo de Uso

```python
from ollama_cloud_config import OllamaCloudConfig

# Inicializar a configuração
ollama_config = OllamaCloudConfig()

# Testar a conexão
ollama_config.test_connection()

# Listar modelos disponíveis
ollama_config.list_models()

# Fazer uma pergunta ao modelo com streaming
messages = [{'role': 'user', 'content': 'Qual é a importância de uma dieta equilibrada?'}]
response = ollama_config.chat_with_model(
    model='gpt-oss:120b-cloud',
    messages=messages,
    stream=True,
    think=True
)
```

## Testando a Conexão

Execute o script de teste:

```bash
python test_ollama_connection.py
```

## Integração com o Projeto Nutri 4.0

Para integrar a funcionalidade do Ollama Cloud com o backend do Nutri 4.0:

1. Crie uma view no Django para lidar com requisições de IA
2. Use a classe `OllamaCloudConfig` para processar as requisições
3. Implemente endpoints da API conforme necessário

## Segurança

- Nunca comite sua chave de API no repositório
- Use o arquivo `.env` para armazenamento seguro
- Considere usar um serviço de gerenciamento de segredos em produção