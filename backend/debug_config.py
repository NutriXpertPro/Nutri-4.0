import os
from pathlib import Path

# Simular a lógica do settings.py
BASE_DIR = Path(__file__).resolve().parent

try:
    from decouple import Config, RepositoryEnv, undefined
    env_path = BASE_DIR / '.env'
    if env_path.exists():
        print(f"Loading .env from {env_path}")
        file_config = Config(RepositoryEnv(env_path))
        
        # Testar a função config personalizada
        def config(key, default=undefined, cast=undefined, **kwargs):
            result = file_config(key, default=default, cast=cast)
            print(f"  Config reading '{key}': '{result}' (type: {type(result).__name__})")
            return result
        
        # Testar leitura das variáveis específicas
        print("\nTesting the custom config function:")
        email_user = config('EMAIL_HOST_USER', default='')
        email_pass = config('EMAIL_HOST_PASSWORD', default='')
        
        print(f"\nResults:")
        print(f"EMAIL_HOST_USER: '{email_user}'")
        print(f"EMAIL_HOST_PASSWORD: '{email_pass}'")
        
        # Verificar se estão vazias
        if not email_user or not email_pass:
            print("\nVariables are empty - checking raw file content:")
            with open(env_path, 'r', encoding='utf-8') as f:
                raw_content = f.read()
                print("Raw .env file content:")
                print(repr(raw_content))
        else:
            print("\nVariables are properly loaded!")
            
except Exception as e:
    print(f"Error in custom config logic: {e}")
    import traceback
    traceback.print_exc()