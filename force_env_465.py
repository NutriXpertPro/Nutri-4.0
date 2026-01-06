
import os
from pathlib import Path

env_path = Path('backend/.env')
if env_path.exists():
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    keys_to_set = {
        'EMAIL_PORT=': 'EMAIL_PORT=465\n',
        'EMAIL_USE_SSL=': 'EMAIL_USE_SSL=True\n',
        'EMAIL_USE_TLS=': 'EMAIL_USE_TLS=False\n'
    }
    
    keys_found = set()
    
    for line in lines:
        matched = False
        for key, value in keys_to_set.items():
            if line.startswith(key):
                new_lines.append(value)
                keys_found.add(key)
                matched = True
                break
        if not matched:
            new_lines.append(line)
            
    for key, value in keys_to_set.items():
        if key not in keys_found:
            new_lines.append(value)
            
    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    print("OK: .env forçado para Port 465 + SSL.")
else:
    print(".env não encontrado.")
