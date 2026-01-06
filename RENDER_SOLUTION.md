# Solução Completa para o Deploy no Render - Nutri 4.0

## Problema Atual

O Render está continuando a falhar com o erro:
```
ModuleNotFoundError: No module named 'config'
```

Mesmo após a correção do Dockerfile, o problema persiste porque o Render está usando um comando de inicialização diferente do que está definido no arquivo `render.yaml`.

## Análise Detalhada

O log do Render mostra:
```
==> Running 'gunicorn config.wsgi:application --bind 0.0.0.0:$PORT'
```

Isso indica que o Render está usando uma configuração de start command definida no dashboard do Render, não o que está no arquivo `render.yaml`.

## Solução Definitiva

### Opção 1: Atualizar a Configuração no Dashboard do Render (Recomendada)

1. Acesse o dashboard do Render: https://dashboard.render.com
2. Localize seu serviço web "nutri-4-0-backend"
3. Clique nas configurações do serviço
4. Encontre o campo "Start Command" ou "Runtime"
5. Substitua qualquer comando existente por:
   ```
   cd backend && python manage.py migrate && gunicorn setup.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120
   ```
6. Salve as alterações
7. Force um novo deploy

### Opção 2: Garantir que o Render Use o Arquivo YAML

Se você quiser garantir que o Render use o arquivo `render.yaml`, verifique:

1. O arquivo `render.yaml` está na raiz do repositório (já está correto)
2. O nome do arquivo está exatamente como `render.yaml` (sem extensão .yml)
3. O serviço no Render foi criado a partir do repositório com o arquivo YAML

### Estrutura do Projeto

- Diretório principal do Django: `backend/setup/`
- Arquivo WSGI: `backend/setup/wsgi.py`
- Arquivo de configurações: `backend/setup/settings.py`
- Arquivo de inicialização: `backend/manage.py`

## Verificação Final

Após aplicar a correção:

1. O comando de start deve usar `setup.wsgi:application`, não `config.wsgi:application`
2. O diretório de trabalho deve ser `backend/` antes de executar os comandos
3. As migrações devem ser executadas antes do Gunicorn iniciar
4. A variável `$PORT` deve ser usada para a porta de escuta

## Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estejam configuradas no Render:

- `DATABASE_URL` - String de conexão do banco de dados
- `SECRET_KEY` - Chave secreta para Django
- `DEBUG` - Definir como `False` para produção
- `ALLOWED_HOSTS` - Domínio do serviço Render (ex: `seu-servico.onrender.com`)

## Por que o arquivo YAML não foi suficiente?

Em alguns casos, o Render pode priorizar as configurações definidas no dashboard sobre o arquivo `render.yaml`, especialmente se o serviço foi criado manualmente ou se as configurações foram modificadas posteriormente.

## Próximos Passos

1. Atualize o Start Command no dashboard do Render conforme indicado acima
2. Redeploy o serviço
3. Monitore os logs para confirmar que o novo comando está sendo executado
4. O erro `ModuleNotFoundError: No module named 'config'` deve desaparecer