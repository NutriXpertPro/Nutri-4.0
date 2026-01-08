from pathlib import Path
from datetime import timedelta
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Configuração do python-decouple
from decouple import config, Csv

# Tenta carregar .env local se existir
# IMPORTANTE: Para SMTP do Google, adicione no seu .env:
# EMAIL_HOST_USER=seu-email@gmail.com
# EMAIL_HOST_PASSWORD=sua-senha-de-app (Gerada em Segurança > Senha de App na conta Google)
# DEFAULT_FROM_EMAIL=Seu Nome <seu-email@gmail.com>
try:
    from decouple import Config, RepositoryEnv, undefined
    env_path = BASE_DIR / '.env'
    if env_path.exists():
        print(f"Loading .env from {env_path}")
        file_config = Config(RepositoryEnv(env_path))
        # Sobrescreve config apenas se .env existir
        def config(key, default=undefined, cast=undefined, **kwargs):
            # Prioriza env vars do sistema se setadas (opcional), ou usa arquivo
            # Aqui mantemos comportamento do arquivo sobrescrever ou ser a fonte
            # Se cast for undefined, não passamos ele para evitar sobrescrever o padrão da lib (que é undefined)
            # Se default for undefined, idem.
            return file_config(key, default=default, cast=cast)
except Exception:
    pass
# Se não entrar no if acima ou der erro, 'config' continua sendo o importado de decouple
# que lê nativamente de os.environ


SECRET_KEY = config('SECRET_KEY', default='dev-secret-key-CHANGE-IN-PRODUCTION-!!!')
GOOGLE_OAUTH2_CLIENT_ID = config('GOOGLE_OAUTH2_CLIENT_ID', default='')
GOOGLE_OAUTH2_CLIENT_SECRET = config('GOOGLE_OAUTH2_CLIENT_SECRET', default='')
BACKEND_URL = config('BACKEND_URL', default='http://localhost:8000')
FRONTEND_URL = config('FRONTEND_URL', default='https://nutri-frontend-1wzv.onrender.com')
DEBUG = config('DEBUG', default=False, cast=bool)
print(f"DEBUG mode is: {DEBUG}")
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=Csv())

# Validade do token de reset de senha: 24 horas (em segundos)
PASSWORD_RESET_TIMEOUT = 86400

# CORS Configuration - TEMPORARIAMENTE PERMISSIVO PARA DEBUG
# Isso permite TODAS as origens. Deve ser removido após identificar o problema.
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # CORS
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'drf_spectacular',  # Documentation
    'django_filters',   # Filters
    'setup',
    'users.apps.UsersConfig',
    'patients.apps.PatientsConfig',
    'diets.apps.DietsConfig',
    'anamnesis.apps.AnamnesisConfig',
    'evaluations.apps.EvaluationsConfig',
    'appointments.apps.AppointmentsConfig',
    'payments.apps.PaymentsConfig',
    'notifications.apps.NotificationsConfig',
    'messages.apps.MessagesConfig',
    'lab_exams.apps.LabExamsConfig',
    'automation.apps.AutomationConfig',
    'branding.apps.BrandingConfig',
    'integrations.apps.IntegrationsConfig',
    'dashboard',
    'django_celery_beat',
    'django_celery_results',
]

AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailBackend',  # Backend personalizado para login com email
    'django.contrib.auth.backends.ModelBackend',  # Backend padrão do Django (mantido para o admin)
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS Middleware (must be before CommonMiddleware)
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
origins_env = config('CORS_ALLOWED_ORIGINS', default="", cast=Csv())

# Inicializa as origens permitidas com localhost e URLs do Render (hardcoded para garantir funcionamento)
origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:8000",
    "https://nutri-frontend-1wzv.onrender.com",  # Frontend do Render
    "https://nutri-4-0-9t8a.onrender.com",       # Backend do Render (para self-requests)
]

# Adiciona origens da variável de ambiente, removendo barras finais
for o in origins_env:
    if o.strip():
        origins.append(o.strip().rstrip('/'))

# Garante que a FRONTEND_URL principal esteja incluída e formatada corretamente
if FRONTEND_URL:
    clean_frontend_url = FRONTEND_URL.strip().rstrip('/')
    if clean_frontend_url and clean_frontend_url not in origins:
        origins.append(clean_frontend_url)

# Remove duplicatas e valores vazios
CORS_ALLOWED_ORIGINS = list(set([o for o in origins if o]))
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
# CORS_ALLOW_ALL_ORIGINS já está definido como True no topo do arquivo para debug

print(f"DEBUG: CORS_ALLOW_ALL_ORIGINS = {CORS_ALLOW_ALL_ORIGINS}")
print(f"DEBUG: CORS_ALLOWED_ORIGINS = {CORS_ALLOWED_ORIGINS}")
print(f"DEBUG: FRONTEND_URL = {FRONTEND_URL}")

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

ROOT_URLCONF = 'setup.urls'

TEMPLATES = [{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages',]},}]

WSGI_APPLICATION = 'setup.wsgi.application'

print("DEBUG: Lendo configurações de banco de dados...")
DATABASE_URL_FROM_ENV = config('DATABASE_URL', default=None)

if not DATABASE_URL_FROM_ENV:
    print("CRITICAL ERROR: DATABASE_URL not found in environment variables!")
    import os
    print(f"Available Environment Variables: {list(os.environ.keys())}")
    # Fallback inseguro apenas para garantir que não quebre silenciosamente tentando localhost sem aviso
    DATABASE_URL_FROM_ENV = 'mysql://root:password@localhost:3306/nutri_xpert_dev'
else:
    print(f"DEBUG: DATABASE_URL found: {DATABASE_URL_FROM_ENV[:15]}... (masked)")

if DATABASE_URL_FROM_ENV.startswith('mysql+pymysql://'):
    DATABASE_URL_FROM_ENV = DATABASE_URL_FROM_ENV.replace('mysql+pymysql://','mysql://',1)
elif DATABASE_URL_FROM_ENV.startswith('postgres://'):
    # dj_database_url handles postgres:// fine, but it's good to be aware
    pass

DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL_FROM_ENV,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Redis Cache (with fallback to local memory for CI)
REDIS_URL = config('REDIS_URL', default='')
if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            }
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }

AUTH_PASSWORD_VALIDATORS = [{'NAME':'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator',},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator',},{'NAME':'django.contrib.auth.password_validation.NumericPasswordValidator',}]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    "default": {
        "BACKEND": config('DEFAULT_FILE_STORAGE', default='django.core.files.storage.FileSystemStorage'),
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage" if not DEBUG else "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'


INTERNAL_IPS = ['127.0.0.1']

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/minute',
        'user': '100/minute',
        'auth': '5/minute',  # Rate limit específico para endpoints de autenticação
    }
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'NutriXpertPro API',
    'DESCRIPTION': 'API para gestão nutricional enterprise',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=365),  # 1 ano - sem necessidade de login frequente
    'REFRESH_TOKEN_LIFETIME': timedelta(days=365),  # 1 ano
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

# Configurações de E-mail
# Tentar ler com decouple primeiro
try:
    EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

    # Se os valores estiverem vazios, tentar ler diretamente das variáveis de ambiente
    if not EMAIL_HOST_USER:
        EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    if not EMAIL_HOST_PASSWORD:
        EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

    # Debug: imprimir valores lidos (apenas se não estiver em produção)
    if DEBUG and not EMAIL_HOST_USER:
        print("DEBUG: EMAIL_HOST_USER está vazio após tentativa de leitura")
    if DEBUG and not EMAIL_HOST_PASSWORD:
        print("DEBUG: EMAIL_HOST_PASSWORD está vazio após tentativa de leitura")

except Exception as e:
    print(f"DEBUG: Erro ao ler configurações de email com decouple: {e}")
    # Fallback para leitura direta do ambiente
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Determinar backend de email com base nas configurações
if EMAIL_HOST_USER and EMAIL_HOST_PASSWORD:
    # Se as credenciais estiverem configuradas, usar SMTP
    EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
    if DEBUG:
        print("DEBUG: Usando backend SMTP porque credenciais estão definidas")
else:
    # Caso contrário, usar console backend (útil para desenvolvimento sem credenciais)
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    if DEBUG:
        print("DEBUG: Using CONSOLE email backend because EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is empty.")

EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=False, cast=bool)
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Nutri Xpert <noreply@nutrixpertpro.com>')

# Configurações do Celery
# Em ambiente de desenvolvimento local (Windows) sem Redis, usamos ALWAYS_EAGER
# Isso faz com que as tasks rodem sincronicamente na mesma thread/processo
if DEBUG:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'
CELERY_BROKER_CONNECTION_TIMEOUT = 1 # Timeout curto para não travar se tentar conectar

# Configuração de arquivos de mídia
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Storage para arquivos de mídia (fotos de avaliações, etc.)
# Configuração para ambiente de desenvolvimento (arquivos locais)
# Para produção, pode-se configurar django-storages com S3 ou CloudFlare R2:
# STORAGES["default"]["BACKEND"] = 'storages.backends.s3boto3.S3Boto3Storage'
# ou
# STORAGES["default"]["BACKEND"] = 'storages.backends.cloudflare_r2.CloudFlareR2Storage'  # se disponível

# Configurações específicas para django-storages (quando utilizado)
AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='')  # ex: us-east-1
AWS_S3_CUSTOM_DOMAIN = config('AWS_S3_CUSTOM_DOMAIN', default='')  # Para CloudFlare R2: <account_id>.r2.cloudflarestorage.com
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = 'public-read'
AWS_S3_VERIFY = True
AWS_LOCATION = 'media'
AWS_QUERYSTRING_AUTH = True  # Para gerar URLs com expiração

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True
    X_FRAME_OPTIONS = 'DENY'
