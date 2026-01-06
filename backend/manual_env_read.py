import os
from pathlib import Path

# Ler o arquivo .env manualmente
def read_env_file(filepath):
    values = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                values[key.strip()] = value.strip()
    return values

# Testar leitura manual
env_path = Path('.env')
env_values = read_env_file(env_path)

print("Values read manually from .env:")
for key, value in env_values.items():
    print(f"  {key}: {repr(value)}")

print(f"\nSpecific email values:")
print(f"  EMAIL_HOST_USER: {repr(env_values.get('EMAIL_HOST_USER', 'NOT_FOUND'))}")
print(f"  EMAIL_HOST_PASSWORD: {repr(env_values.get('EMAIL_HOST_PASSWORD', 'NOT_FOUND'))}")
print(f"  EMAIL_BACKEND: {repr(env_values.get('EMAIL_BACKEND', 'NOT_FOUND'))}")