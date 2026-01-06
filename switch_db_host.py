
import os

env_path = 'backend/.env'
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Trocar localhost por 127.0.0.1 na DATABASE_URL
    new_content = content.replace('localhost:3306', '127.0.0.1:3306')
    
    with open(env_path, 'w') as f:
        f.write(new_content)
    print("DATABASE_URL atualizada para 127.0.0.1")
else:
    print(".env nao encontrado")
