
import os
from pathlib import Path

env_path = Path('backend/.env')
if env_path.exists():
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Substituir colados por quebra de linha
    if 'rootEMAIL_PORT' in content:
        content = content.replace('rootEMAIL_PORT', 'root\nEMAIL_PORT')
    
    # Garantir que EMAIL_PORT=465 é o único
    import re
    content = re.sub(r'EMAIL_PORT=\d+', 'EMAIL_PORT=465', content)
    
    with open(env_path, 'w') as f:
        f.write(content)
    print("OK: .env limpo e corrigido.")
else:
    print(".env não encontrado.")
