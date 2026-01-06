
import os
from pathlib import Path

env_path = Path('backend/.env')
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key = line.split('=')[0].strip()
                print(f"Key: {key}")
else:
    print(".env file not found")
