from pathlib import Path
from datetime import timedelta
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# FORCAR CARREGAMENTO MANUAL DO .ENV
try:
    from decouple import Config, RepositoryEnv
    env_path = BASE_DIR / '.env'
    print(f".env file location: {env_path}")
    
    if env_path.exists():
        env_config = Config(RepositoryEnv(env_path))
        def config(key, default=None, cast=None, **kwargs):
            if cast:
                return env_config(key, default=default, cast=cast)
            return env_config(key, default=default)
        Csv = lambda x: x.split(',')
        print(".env loaded successfully!")
    else:
        print(f"❌ .env not found at: {env_path}")
        raise FileNotFoundError(f'.env not found at: {env_path}')
except Exception as e:
    print(f"Error loading .env: {e}")
    def config(key, default=None, cast=None, **kwargs):
        return cast(default) if cast else default
    Csv = lambda x: x.split(',')

SECRET_KEY = config('SECRET_KEY', default='dev-secret-key-CHANGE-IN-PRODUCTION-!!!')
GOOGLE_OAUTH2_CLIENT_ID = config('GOOGLE_OAUTH2_CLIENT_ID', default='')
DEBUG = config('DEBUG', default=False, cast=bool)
print(f"DEBUG mode is: {DEBUG}")
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost', cast=Csv)

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
    'lab_exams.apps.LabExamsConfig'
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
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'setup.urls'

TEMPLATES = [{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages',]},}]

WSGI_APPLICATION = 'setup.wsgi.application'

DATABASE_URL_FROM_ENV = config('DATABASE_URL',default='mysql://root:password@localhost:3306/nutri_xpert_dev')
if DATABASE_URL_FROM_ENV.startswith('mysql+pymysql://'):
    DATABASE_URL_FROM_ENV = DATABASE_URL_FROM_ENV.replace('mysql+pymysql://','mysql://',1)
DATABASES = {'default':dj_database_url.parse(DATABASE_URL_FROM_ENV)}

# Redis Cache
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config('REDIS_URL', default='redis://localhost:6379/1'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

AUTH_PASSWORD_VALIDATORS = [{'NAME':'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator',},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator',},{'NAME':'django.contrib.auth.password_validation.NumericPasswordValidator',}]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'


INTERNAL_IPS = ['127.0.0.1']

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'NutriXpertPro API',
    'DESCRIPTION': 'API para gestão nutricional enterprise',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

SIMPLE_JWT = {'ACCESS_TOKEN_LIFETIME':timedelta(minutes=5),'REFRESH_TOKEN_LIFETIME':timedelta(days=1),'ROTATE_REFRESH_TOKENS':True,'BLACKLIST_AFTER_ROTATION':True,'UPDATE_LAST_LOGIN':False,'ALGORITHM':'HS256','SIGNING_KEY':SECRET_KEY,'AUTH_HEADER_TYPES':('Bearer',),'USER_ID_FIELD':'id','USER_ID_CLAIM':'user_id','AUTH_TOKEN_CLASSES':('rest_framework_simplejwt.tokens.AccessToken',),'TOKEN_TYPE_CLAIM':'token_type','JTI_CLAIM':'jti',}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

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
