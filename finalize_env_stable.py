
import os

env_path = 'backend/.env'

def finalize_env():
    print("Finalizando configuracao do .env em modo ESTAVEL (Porta 465)...")
    if not os.path.exists(env_path):
        print(f"Erro: {env_path} nao encontrado.")
        return

    with open(env_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    keys_to_update = {
        'EMAIL_PORT': '465',
        'EMAIL_USE_TLS': 'False',
        'EMAIL_USE_SSL': 'True',
        'EMAIL_HOST_USER': 'nutrixpertpro@gmail.com',
        'DEFAULT_FROM_EMAIL': 'Nutri 4.0 <nutrixpertpro@gmail.com>'
    }
    seen_keys = set()

    for line in lines:
        match = False
        for key in keys_to_update:
            if line.startswith(f"{key}="):
                if key not in seen_keys:
                    new_lines.append(f"{key}={keys_to_update[key]}\n")
                    seen_keys.add(key)
                match = True
                break
        if not match:
            new_lines.append(line)
            
    for key, val in keys_to_update.items():
        if key not in seen_keys:
            new_lines.append(f"{key}={val}\n")

    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    print("Configuracao finalizada!")

if __name__ == "__main__":
    finalize_env()
