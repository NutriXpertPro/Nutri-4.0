
import os
from pathlib import Path

env_path = Path('backend/.env')
if env_path.exists():
    lines = []
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Flags to track if we found the keys
    found_port = False
    found_tls = False
    found_ssl = False
    
    new_lines = []
    for line in lines:
        if line.startswith('EMAIL_PORT='):
            new_lines.append('EMAIL_PORT=465\n')
            found_port = True
        elif line.startswith('EMAIL_USE_TLS='):
            new_lines.append('EMAIL_USE_TLS=False\n')
            found_tls = True
        elif line.startswith('EMAIL_USE_SSL='):
            new_lines.append('EMAIL_USE_SSL=True\n')
            found_ssl = True
        else:
            new_lines.append(line)
            
    if not found_port:
        new_lines.append('EMAIL_PORT=465\n')
    if not found_tls:
        new_lines.append('EMAIL_USE_TLS=False\n')
    if not found_ssl:
        new_lines.append('EMAIL_USE_SSL=True\n')
        
    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    print("OK: .env atualizado com as configurações de SSL.")
else:
    print(".env não encontrado.")
