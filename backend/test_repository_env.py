from pathlib import Path
from decouple import Config, RepositoryEnv

# Caminho do arquivo .env
env_path = Path('.env')

# Criar configuração com RepositoryEnv
config = Config(RepositoryEnv(env_path))

# Testar leitura específica
email_user = config('EMAIL_HOST_USER')
email_pass = config('EMAIL_HOST_PASSWORD')
email_backend = config('EMAIL_BACKEND')

print(f"EMAIL_HOST_USER via Config(RepositoryEnv): {repr(email_user)}")
print(f"EMAIL_HOST_PASSWORD via Config(RepositoryEnv): {repr(email_pass)}")
print(f"EMAIL_BACKEND via Config(RepositoryEnv): {repr(email_backend)}")

# Testar leitura de todas as chaves
all_keys = ['DJANGO_ENV', 'EMAIL_HOST_USER', 'EMAIL_HOST_PASSWORD', 'EMAIL_BACKEND', 'DEFAULT_FROM_EMAIL', 'DATABASE_URL']
for key in all_keys:
    try:
        value = config(key)
        print(f"{key}: {repr(value)}")
    except:
        print(f"{key}: ERROR")