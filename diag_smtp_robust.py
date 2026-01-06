
import smtplib
import ssl
import os
import socket

# Configurações do .env
USER = 'andersoncarlosvp@gmail.com'
PASS = 'jzxsnblrfiwlxuhe'
PORT = 465

def test_smtp_robust():
    print(f"--- DIAGNÓSTICO ROBUSTO ---")
    print(f"Target: smtp.gmail.com:{PORT}")
    print(f"User: {USER}")
    
    try:
        print("1. Testando resolução de DNS...")
        ip = socket.gethostbyname('smtp.gmail.com')
        print(f"   IP resolvido: {ip}")
        
        print("2. Testando conexão TCP...")
        socket.create_connection(('smtp.gmail.com', PORT), timeout=10)
        print("   TCP Conectado!")
        
        context = ssl.create_default_context()
        print("3. Iniciando conexão SSL...")
        server = smtplib.SMTP_SSL('smtp.gmail.com', PORT, context=context, timeout=15)
        print("   SSL Handshake OK!")
        
        print("4. Enviando EHLO...")
        server.ehlo()
        
        print("5. Tentando Login...")
        try:
            server.login(USER, PASS)
            print("   LOGIN SUCESSO!")
        except smtplib.SMTPAuthenticationError as e:
            print(f"   FALHA DE AUTENTICAÇÃO: {e}")
        except Exception as e:
            print(f"   ERRO DURANTE O LOGIN: {type(e).__name__}: {e}")
            
        server.quit()
        print("--- TESTE FINALIZADO ---")

    except Exception as e:
        print(f"FALHA GERAL: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test_smtp_robust()
