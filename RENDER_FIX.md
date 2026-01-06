# Correção para Deploy no Render - Nutri 4.0

## Problema Identificado

O erro ocorre porque o Gunicorn está tentando importar `config.wsgi:application`, mas o módulo correto é `setup.wsgi:application`.

Erro exibido:
```
ModuleNotFoundError: No module named 'config'
```

## Solução

O problema foi corrigido no arquivo `backend/Dockerfile`, alterando a linha:

**Antes:**
```
CMD python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120
```

**Depois:**
```
CMD python manage.py migrate && gunicorn setup.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120
```

## Estrutura do Projeto

- O arquivo `wsgi.py` está localizado em: `backend/setup/wsgi.py`
- O arquivo `manage.py` está localizado em: `backend/manage.py`
- O diretório raiz do Django é: `backend/setup/`

## Checklist Rápido

- ✅ Verificado: Existe `setup/__init__.py`
- ✅ Confirmado: Localização correta de `setup/wsgi.py`
- ✅ Configurado: Root Directory correto no Render (deve ser `/backend` ou o diretório que contém o `manage.py`)
- ✅ Ajustado: Comando do Gunicorn para usar `setup.wsgi:application`
- ✅ Adicionado: PYTHONPATH configurado corretamente no Render

## Configurações Necessárias no Render

1. **Root Directory**: `/backend`
2. **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
3. **Start Command**: `python manage.py migrate && gunicorn setup.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120`
4. **Environment Variables**:
   - `DATABASE_URL` - String de conexão do banco de dados
   - `SECRET_KEY` - Chave secreta para Django
   - `DEBUG` - Definir como `False` para produção
   - `ALLOWED_HOSTS` - Domínio do serviço Render

## Próximos Passos

1. Faça commit das alterações no Dockerfile
2. Atualize o serviço no Render para usar a nova versão
3. Verifique se o deploy é bem-sucedido

## Observações

O arquivo `render.yaml` já estava configurado corretamente com `setup.wsgi:application`, então o problema estava apenas no Dockerfile que é usado quando o Render não utiliza o arquivo de configuração YAML.