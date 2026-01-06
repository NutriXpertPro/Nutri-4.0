
import os

env_path = 'backend/.env'

def patch_to_587():
    print("Iniciando patch do .env para porta 587/TLS...")
    if not os.path.exists(env_path):
        print(f"Erro: {env_path} nao encontrado.")
        return

    with open(env_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    # Remover duplicatas e atualizar valores
    keys_to_update = {
        'EMAIL_PORT': '587',
        'EMAIL_USE_TLS': 'True',
        'EMAIL_USE_SSL': 'False'
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
            
    # Garantir que as chaves existam
    for key, val in keys_to_update.items():
        if key not in seen_keys:
            new_lines.append(f"{key}={val}\n")

    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    print("Patch concluido com sucesso!")

if __name__ == "__main__":
    patch_to_587()
