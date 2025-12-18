# Guia de Deploy - NutriXpertPro

## 🚀 Visão Geral

Este guia detalha o processo de deploy da aplicação NutriXpertPro em ambiente de produção.

## 📋 Pré-requisitos

### Backend (Servidor Linux)
- Python 3.10+
- PostgreSQL 12+ (ou MySQL 8+)
- Redis 6+
- Node.js 18+ (para build do frontend)
- Nginx
- Certbot (para SSL)
- Docker e Docker Compose (opcional)

### Frontend (CDN ou Servidor Web)
- Servidor web (Vercel, Netlify, AWS S3, etc.)
- CDN (recomendado para performance)

## 🏗️ Arquitetura de Produção

```
[Cliente] 
    ↓ (HTTPS)
[CDN (opcional)]
    ↓
[Nginx (SSL/TLS)]
    ↓
[Backend API] ← [Frontend SPA]
    ↓
[Redis] ← [PostgreSQL/MySQL]
```

## 🔧 Configuração do Backend

### 1. Servidor Base
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3.10 python3.10-venv python3.10-dev build-essential libpq-dev nginx certbot python3-certbot-nginx supervisor git -y
```

### 2. Configuração do Banco de Dados
```bash
# Para PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres createuser --interactive nutrixpert_user
sudo -u postgres createdb nutrixpert_db --owner nutrixpert_user
```

### 3. Configuração do Redis
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 4. Deploy da Aplicação
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/nutrixpertpro.git
cd nutrixpertpro/backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com credenciais de produção
```

### 5. Variáveis de Ambiente (.env)
```
DEBUG=False
SECRET_KEY=sua-chave-secreta-forte
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=nutrixpert_db
DB_USER=nutrixpert_user
DB_PASSWORD=sua-senha-segura
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/1

# Email (SMTP)
EMAIL_HOST=smtp.seu-provedor.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@dominio.com
EMAIL_HOST_PASSWORD=sua-senha

# Google OAuth
GOOGLE_OAUTH2_CLIENT_ID=seu-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=seu-client-secret
GOOGLE_OAUTH2_REDIRECT_URI=https://seu-dominio.com/api/v1/auth/google/

# Backend e Frontend URLs
BACKEND_URL=https://api.seu-dominio.com
FRONTEND_URL=https://seu-dominio.com
```

### 6. Migrações e Coleta de Static Files
```bash
# Executar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Criar superusuário
python manage.py createsuperuser
```

### 7. Configuração do Gunicorn
```bash
# Instalar gunicorn
pip install gunicorn

# Criar arquivo de configuração gunicorn.conf.py
cat > gunicorn.conf.py << EOF
bind = "127.0.0.1:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 5
max_keepalive_requests = 100
max_keepalive_time = 100
preload_app = True
pythonpath = "."
chdir = "."
user = "www-data"
group = "www-data"
tmp_upload_dir = None
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'
loglevel = "info"
capture_output = True
enable_stdio_inheritance = True
EOF
```

### 8. Configuração do Supervisor
```bash
# Criar arquivo de configuração do supervisor
sudo tee /etc/supervisor/conf.d/nutrixpertpro.conf << EOF
[program:nutrixpertpro]
command=/caminho/para/seu/projeto/venv/bin/gunicorn --config gunicorn.conf.py setup.wsgi:application
directory=/caminho/para/seu/projeto
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/supervisor/nutrixpertpro.log
environment=PATH="/caminho/para/seu/projeto/venv/bin"
EOF

# Recarregar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start nutrixpertpro
```

## 🌐 Configuração do Nginx

### 1. Configuração do Site
```bash
sudo tee /etc/nginx/sites-available/nutrixpertpro << EOF
server {
    listen 80;
    server_name api.seu-dominio.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/api.seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Aumentar tamanho máximo de upload para fotos de avaliações
        client_max_body_size 10M;
    }

    # Servir arquivos de mídia
    location /media/ {
        alias /caminho/para/seu/projeto/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Servir arquivos estáticos (se não usar CDN)
    location /static/ {
        alias /caminho/para/seu/projeto/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/nutrixpertpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Obter Certificado SSL
```bash
sudo certbot --nginx -d api.seu-dominio.com
```

## 🚀 Deploy do Frontend

### Opção 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Fazer deploy
cd frontend
vercel --prod
```

### Opção 2: Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Fazer deploy
cd frontend
npm run build
netlify deploy --prod
```

### Opção 3: Servidor Próprio
```bash
# Build do Next.js
cd frontend
npm run build

# Configurar Nginx para servir o frontend
sudo tee /etc/nginx/sites-available/frontend << EOF
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    root /caminho/para/frontend/out;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Configuração de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🛠️ Configurações Adicionais

### 1. Backup Automático
```bash
# Script de backup
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"

# Backup do banco de dados
pg_dump nutrixpert_db > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup de arquivos de mídia
tar -czf \$BACKUP_DIR/media_backup_\$DATE.tar.gz /path/to/media/

# Remover backups antigos (mais de 30 dias)
find \$BACKUP_DIR -name "*.sql" -mtime +30 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Adicionar ao crontab para backup diário
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### 2. Monitoring com Sentry (Opcional)
```bash
# Instalar sentry-sdk no backend
pip install sentry-sdk

# Adicionar ao settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="seu-sentry-dsn-aqui",
    integrations=[DjangoIntegration()],

    # Opções de performance
    traces_sample_rate=1.0,

    # Mudar para produção
    environment="production",
    
    # Desativar debug em produção
    debug=False,
)
```

### 3. Health Checks
```bash
# Adicionar endpoint de health check
# Em setup/urls.py
path('health/', lambda request: JsonResponse({'status': 'healthy'}), name='health-check'),
```

## 🧪 Testes de Deploy

### 1. Verificar Conexão com Banco de Dados
```bash
python manage.py dbshell
```

### 2. Rodar Testes
```bash
python manage.py test
```

### 3. Verificar Permissões
```bash
python manage.py check --deploy
```

## 🔄 Atualização da Aplicação

### 1. Processo de Deploy
```bash
# No servidor
cd /path/to/nutrixpertpro
git pull origin main

# Atualizar dependências
source venv/bin/activate
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Reiniciar aplicações
sudo supervisorctl restart nutrixpertpro
sudo systemctl reload nginx
```

### 2. Rollback (se necessário)
```bash
# Voltar para commit anterior
git reset --hard HEAD~1
python manage.py migrate --fake-reverse app_name 0001

# Reiniciar aplicações
sudo supervisorctl restart nutrixpertpro
```

## 📊 Monitoramento

### Logs
- Backend: `/var/log/gunicorn/`
- Nginx: `/var/log/nginx/`
- Supervisor: `/var/log/supervisor/`

### Métricas
- Configurar Prometheus + Grafana (opcional)
- Monitoramento de uptime (UptimeRobot, etc.)
- Monitoramento de performance (New Relic, etc.)

## 🚨 Problemas Comuns e Soluções

### 1. Permissões de Arquivo
```bash
sudo chown -R www-data:www-data /path/to/project/
sudo chmod -R 755 /path/to/project/
```

### 2. Timeout de Conexão
Ajustar `timeout` no Gunicorn e `proxy_read_timeout` no Nginx.

### 3. Erros de CORS
Verificar `CORS_ALLOWED_ORIGINS` no settings do Django.

---

**Última Atualização**: 16/12/2025  
**Versão do Documento**: 1.0