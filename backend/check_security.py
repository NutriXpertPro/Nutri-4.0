#!/usr/bin/env python3
"""
Script de verificação de segurança para o projeto Nutri 4.0
Este script verifica se as configurações de segurança estão corretas antes de executar a aplicação.
"""
import os
import sys
import getpass

def check_security_config():
    """Função para verificar as configurações de segurança"""
    print("Verificando configurações de segurança...")
    
    # Verificar se estamos em ambiente de produção
    env = os.environ.get('DJANGO_ENV', 'development')
    print(f"Ambiente: {env}")
    
    # Verificar variáveis críticas
    critical_vars = [
        'DJANGO_SECRET_KEY',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
    ]
    
    if env == 'production':
        missing_vars = []
        for var in critical_vars:
            if not os.environ.get(var):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"ERRO: As seguintes variáveis críticas não estão definidas: {', '.join(missing_vars)}")
            return False
        
        # Verificar se SECRET_KEY é segura (longa e complexa)
        secret_key = os.environ.get('DJANGO_SECRET_KEY')
        if len(secret_key) < 50:
            print("AVISO: A SECRET_KEY deve ter pelo menos 50 caracteres para produção")
        
        # Verificar DEBUG
        debug = os.environ.get('DJANGO_DEBUG', 'False').lower() == 'true'
        if debug and env == 'production':
            print("AVISO: DEBUG está ativado em produção - isso é um risco de segurança")
        
        # Verificar ALLOWED_HOSTS
        allowed_hosts = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')
        if 'localhost' in allowed_hosts or '127.0.0.1' in allowed_hosts:
            print("AVISO: localhost ou 127.0.0.1 estão em ALLOWED_HOSTS em produção")
    
    print("Verificação de segurança concluída.")
    return True

def main():
    """Função principal"""
    if not check_security_config():
        print("Verificação de segurança falhou. Saindo...")
        sys.exit(1)
    
    print("Todas as verificações de segurança passaram!")
    
    # Perguntar ao usuário se deseja continuar
    if os.environ.get('DJANGO_ENV') == 'production':
        response = input("Deseja continuar com a execução em produção? (s/N): ")
        if response.lower() not in ['s', 'sim', 'y', 'yes']:
            print("Execução cancelada pelo usuário.")
            sys.exit(0)

if __name__ == "__main__":
    main()