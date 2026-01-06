import os
import sys
import socket

# Adiciona o diretório backend ao path para conseguir importar o settings
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')

# Tenta carregar o Django para pegar as configs processadas pelo decouple/settings
import django
from django.conf import settings
from decouple import config

# Correção temporária para problema com decouple
def get_env_value(key, default=''):
    """Função auxiliar para obter valores do .env com fallback"""
    # Tenta obter do settings do Django primeiro
    try:
        value = getattr(settings, key, None)
        if value is not None and value != '':
            return value
    except:
        pass

    # Tenta obter diretamente do ambiente
    try:
        value = os.environ.get(key, None)
        if value is not None and value != '':
            return value
    except:
        pass

    # Tenta obter com decouple
    try:
        value = config(key, default=default)
        if value != '':
            return value
    except:
        pass

    return default

def diagnose():
    print("--- Diagnóstico de Configuração de E-mail ---")

    # É necessário chamar setup() para carregar settings
    try:
        django.setup()
    except Exception as e:
        print(f"Erro ao carregar Django: {e}")
        return

    # Verificar variáveis críticas
    email_backend = get_env_value('EMAIL_BACKEND', settings.EMAIL_BACKEND if hasattr(settings, 'EMAIL_BACKEND') else 'django.core.mail.backends.smtp.EmailBackend')
    host = get_env_value('EMAIL_HOST', settings.EMAIL_HOST if hasattr(settings, 'EMAIL_HOST') else 'smtp.gmail.com')
    port = get_env_value('EMAIL_PORT', str(settings.EMAIL_PORT if hasattr(settings, 'EMAIL_PORT') else 587))
    user = get_env_value('EMAIL_HOST_USER', settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else '')
    password = get_env_value('EMAIL_HOST_PASSWORD', settings.EMAIL_HOST_PASSWORD if hasattr(settings, 'EMAIL_HOST_PASSWORD') else '')
    use_tls = get_env_value('EMAIL_USE_TLS', str(settings.EMAIL_USE_TLS if hasattr(settings, 'EMAIL_USE_TLS') else True))

    # Converter port e use_tls para os tipos corretos
    try:
        port = int(port)
    except ValueError:
        port = 587  # valor padrão

    try:
        use_tls = use_tls.lower() in ['true', '1', 'yes', 'on']
    except:
        use_tls = True  # valor padrão

    print(f"EMAIL_BACKEND: {email_backend}")
    print(f"EMAIL_HOST: {host}")
    print(f"EMAIL_PORT: {port}")
    print(f"EMAIL_USE_TLS: {use_tls}")
    print(f"EMAIL_HOST_USER: {'[DEFINIDO]' if user else '[VAZIO/FALTANDO]'}")
    print(f"EMAIL_HOST_PASSWORD: {'[DEFINIDO]' if password else '[VAZIO/FALTANDO]'}")

    if not user or not password:
        print("\n[ERRO] Usuário ou senha de e-mail não estão configurados!")
        print("Verifique seu arquivo .env em backend/.env")
        print("\nExemplo de configuração no .env:")
        print("EMAIL_HOST_USER=seu-email@gmail.com")
        print("EMAIL_HOST_PASSWORD=sua-senha-de-app")
        print("DEFAULT_FROM_EMAIL=Nome <seu-email@gmail.com>")
        return

    print("\nTestando conexão com servidor SMTP...")
    try:
        sock = socket.create_connection((host, port), timeout=5)
        print(f"[OK] Conexão TCP com {host}:{port} bem sucedida.")
        sock.close()
    except Exception as e:
        print(f"[FALHA] Não foi possível conectar ao servidor SMTP: {e}")
        print("Verifique se o host/porta estão corretos ou se há firewall bloqueando.")

    print(f"\n[INFO] Backend de email configurado: {email_backend}")
    if 'console' in email_backend.lower():
        print("[AVISO] O backend de email está configurado para usar o console, o que é adequado apenas para desenvolvimento.")
        print("Em produção, configure EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend")

if __name__ == '__main__':
    diagnose()