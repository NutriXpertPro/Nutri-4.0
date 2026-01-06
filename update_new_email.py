
import os
import re

env_path = 'backend/.env'

def update_env():
    new_user = 'nutrixpertpro@gmail.com'
    new_pass = 'wktjgaxveewodrwt'.replace(' ', '')
    new_from = f'Nutri 4.0 <{new_user}>'

    if not os.path.exists(env_path):
        print(f"Erro: {env_path} nao encontrado.")
        return

    with open(env_path, 'r') as f:
        lines = f.readlines()

    updated = []
    found_user = False
    found_pass = False
    found_from = False

    for line in lines:
        if line.startswith('EMAIL_HOST_USER='):
            updated.append(f'EMAIL_HOST_USER={new_user}\n')
            found_user = True
        elif line.startswith('EMAIL_HOST_PASSWORD='):
            updated.append(f'EMAIL_HOST_PASSWORD={new_pass}\n')
            found_pass = True
        elif line.startswith('DEFAULT_FROM_EMAIL='):
            updated.append(f'DEFAULT_FROM_EMAIL={new_from}\n')
            found_from = True
        else:
            updated.append(line)

    if not found_user: updated.append(f'EMAIL_HOST_USER={new_user}\n')
    if not found_pass: updated.append(f'EMAIL_HOST_PASSWORD={new_pass}\n')
    if not found_from: updated.append(f'DEFAULT_FROM_EMAIL={new_from}\n')

    with open(env_path, 'w') as f:
        f.writelines(updated)
    
    print("Sucesso: .env atualizado com novas credenciais.")

if __name__ == "__main__":
    update_env()
