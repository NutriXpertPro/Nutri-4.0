from decouple import Config, RepositoryEnv

# Testar leitura do arquivo .env
config = Config(RepositoryEnv('.env'))

print("Testando leitura do arquivo .env:")
print(f"EMAIL_HOST_USER: '{config('EMAIL_HOST_USER', default='NOT_FOUND')}'")
print(f"EMAIL_HOST_PASSWORD: '{config('EMAIL_HOST_PASSWORD', default='NOT_FOUND')}'")
print(f"EMAIL_BACKEND: '{config('EMAIL_BACKEND', default='NOT_FOUND')}'")
print(f"DEFAULT_FROM_EMAIL: '{config('DEFAULT_FROM_EMAIL', default='NOT_FOUND')}'")

# Testar também com o método padrão
from decouple import config as default_config
print("\nTestando com o método padrão do decouple:")
print(f"EMAIL_HOST_USER: '{default_config('EMAIL_HOST_USER', default='NOT_FOUND')}'")
print(f"EMAIL_HOST_PASSWORD: '{default_config('EMAIL_HOST_PASSWORD', default='NOT_FOUND')}'")