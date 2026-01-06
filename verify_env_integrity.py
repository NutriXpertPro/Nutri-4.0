
import os

env_path = 'backend/.env'
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('EMAIL_HOST_USER='):
                val = line.split('=')[1].strip()
                print(f"USER: '{val}' (len={len(val)})")
            if line.startswith('EMAIL_HOST_PASSWORD='):
                val = line.split('=')[1].strip()
                print(f"PASS: '{val[0]}***{val[-1]}' (len={len(val)})")
else:
    print(".env não encontrado.")
