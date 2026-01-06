
import os
from pathlib import Path
from decouple import Config, RepositoryEnv

env_path = Path('backend/.env')
if env_path.exists():
    config = Config(RepositoryEnv(env_path))
    user = config('EMAIL_HOST_USER', default='')
    password = config('EMAIL_HOST_PASSWORD', default='')
    
    if ' ' in password:
        print("AVISO: A senha de email (EMAIL_HOST_PASSWORD) contém espaços!")
    else:
        print("EMAIL_HOST_PASSWORD não contém espaços.")
        
    if ' ' in user:
        print("AVISO: O email (EMAIL_HOST_USER) contém espaços!")
    else:
        print("EMAIL_HOST_USER não contém espaços.")
else:
    print(".env file not found")
