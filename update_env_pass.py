
import os
from pathlib import Path

env_path = Path('backend/.env')
new_pass = "jzxs nblr fiwl xuhe".replace(" ", "")

if env_path.exists():
    with open(env_path, 'r') as f:
        content = f.read()
    
    import re
    # Atualiza a senha removendo espaços
    content = re.sub(r'EMAIL_HOST_PASSWORD=.*', f'EMAIL_HOST_PASSWORD={new_pass}', content)
    
    with open(env_path, 'w') as f:
        f.write(content)
    print(f"OK: Senha de app atualizada com sucesso (len={len(new_pass)}).")
else:
    print(".env não encontrado.")
