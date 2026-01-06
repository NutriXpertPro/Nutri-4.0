# Testar leitura linha a linha do arquivo .env para identificar o problema
with open('.env', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Linhas do arquivo .env:")
for i, line in enumerate(lines):
    print(f"{i+1}: {repr(line)}")

print("\nAnálise das linhas específicas:")
for i, line in enumerate(lines):
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        parts = line.split('=', 1)
        if len(parts) == 2:
            key, value = parts
            print(f"  {key.strip()} = {repr(value.strip())}")
        else:
            print(f"  Linha malformada: {repr(line)}")

# Testar se o problema está com caracteres específicos
print("\nTestando valores específicos:")
test_email = "andersoncarlosvp@gmail.com"
test_password = "zjkpfcqnpmkwlwkb"
print(f"Email test: {repr(test_email)}")
print(f"Password test: {repr(test_password)}")

# Testar se podemos reproduzir o problema com um arquivo temporário
temp_content = "EMAIL_HOST_USER=andersoncarlosvp@gmail.com\nEMAIL_HOST_PASSWORD=zjkpfcqnpmkwlwkb\n"
with open('temp_test.env', 'w', encoding='utf-8') as f:
    f.write(temp_content)

from decouple import Config, RepositoryEnv
temp_config = Config(RepositoryEnv('temp_test.env'))

print(f"\nTeste com arquivo temporário:")
try:
    temp_email = temp_config('EMAIL_HOST_USER')
    temp_pass = temp_config('EMAIL_HOST_PASSWORD')
    print(f"  EMAIL_HOST_USER: {repr(temp_email)}")
    print(f"  EMAIL_HOST_PASSWORD: {repr(temp_pass)}")
except Exception as e:
    print(f"  Erro: {e}")

# Limpar arquivo temporário
import os
os.remove('temp_test.env')