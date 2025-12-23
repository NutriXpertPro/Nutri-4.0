# Guia de Deploy na Railway - Nutri 4.0

## Visão Geral

Este guia explica como configurar e fazer o deploy do backend Django e frontend Next.js do Nutri 4.0 na Railway.

## Pré-requisitos

1. Conta na Railway (https://railway.app)
2. Repositório Git com o código do projeto
3. Conta GitHub conectada à Railway

## Configuração do Backend

### 1. Criar Novo Projeto na Railway

1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório do Nutri 4.0
5. Selecione a pasta `backend` como source directory

### 2. Configurar Variáveis de Ambiente

No painel do projeto Railway, vá para "Variables" e adicione as seguintes variáveis:

#### Variáveis Obrigatórias
```
DJANGO_ENV=production
DJANGO_SECRET_KEY= sua-chave-secreta-aqui (mínimo 50 caracteres)
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=seu-domínio-railway.railway.app

# Database (Railway MySQL)
DB_NAME=railway
DB_USER=root
DB_PASSWORD=sua-senha-do-banco
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306

SIMPLE_JWT_SECRET_KEY=sua-chave-jwt-secreta-aqui
```

#### Variáveis Opcionais
```
REDIS_URL=redis://localhost:6379/1
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app
GOOGLE_OAUTH2_CLIENT_ID=seu-client-id-google
```

### 3. Configurar Banco de Dados

1. No projeto Railway, adicione um serviço "MySQL"
2. O Railway vai fornecer automaticamente as variáveis de ambiente do banco
3. Use as credenciais fornecidas nas variáveis de ambiente do backend

## Configuração do Frontend

### 1. Criar Projeto Frontend

1. No mesmo projeto Railway, clique em "New Service"
2. Selecione "Deploy from GitHub repo"
3. Escolha o mesmo repositório
4. Selecione a pasta `frontend` como source directory

### 2. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis para o frontend:

```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://seu-backend-url.railway.app
NEXT_PUBLIC_APP_URL=https://seu-frontend-url.railway.app
```

## Configurações de CORS

No backend, ajuste as configurações de CORS para permitir o domínio do frontend:

No arquivo `backend/config/settings.py`, adicione seu domínio Railway:

```python
CORS_ALLOWED_ORIGINS = [
    "https://seu-frontend-url.railway.app",
    "https://seu-backend-url.railway.app",
]
```

## Comandos Úteis

### Verificar Logs
```bash
# Backend
railway logs backend

# Frontend  
railway logs frontend
```

### Redeploy
```bash
# Push de novas alterações
git add .
git commit -m "Update deploy"
git push origin main

# Ou forçar redeploy na interface Railway
```

### Acessar Banco de Dados
```bash
# Via Railway CLI
railway mysql
```

## Troubleshooting Comum

### 1. Erro de Build do Backend
- Verifique se `requirements.txt` existe na pasta backend
- Confirme que todas as dependências estão listadas corretamente

### 2. Erro de Migrations
- O comando `python manage.py migrate` é executado automaticamente no deploy
- Se necessário, execute manualmente via Railway Console

### 3. Problemas de CORS
- Verifique se o domínio do frontend está em `CORS_ALLOWED_ORIGINS`
- Confirme que `NEXT_PUBLIC_API_URL` está configurada corretamente

### 4. Health Check Falhando
- O endpoint `/api/health/` deve retornar status 200
- Verifique logs para identificar problemas de inicialização

## URLs Finais

Após o deploy, suas aplicações estarão disponíveis em:

- **Backend**: `https://seu-backend-url.railway.app`
- **Frontend**: `https://seu-frontend-url.railway.app`
- **API Docs**: `https://seu-backend-url.railway.app/admin/`

## Monitoramento

1. Configure alertas no painel Railway
2. Monitore logs regularmente
3. Use o dashboard da Railway para verificar métricas

## Segurança

1. Nunca commit secrets no repositório
2. Use variáveis de ambiente para todas as credenciais
3. Habilite HTTPS (automático na Railway)
4. Configure domínios personalizados se necessário

## Backup Automático

A Railway oferece backup automático para bancos de dados MySQL. Verifique as configurações de retenção no painel.

---

## Suporte

- Documentação Railway: https://docs.railway.app
- Django deploy guide: https://docs.djangoproject.com/en/stable/howto/deployment/
- Next.js deploy guide: https://nextjs.org/docs/deployment
