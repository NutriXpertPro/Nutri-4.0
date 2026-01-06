
import smtplib
import ssl
import os
import re

# Ler .env manualmente para evitar django.setup()
USER = None
PASS = None
PORT = 465

env_path = 'backend/.env'
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('EMAIL_HOST_USER='):
                USER = line.split('=')[1].strip()
            if line.startswith('EMAIL_HOST_PASSWORD='):
                PASS = line.split('=')[1].strip()
            if line.startswith('EMAIL_PORT='):
                try:
                    PORT = int(line.split('=')[1].strip())
                except:
                    pass

print(f"Iniciando teste bruto para {USER} na porta {PORT}...")
if not USER or not PASS:
    print("ERRO: Credenciais não encontradas no .env")
    exit(1)

try:
    context = ssl.create_default_context()
    print("1. Conectando via SSL...")
    with smtplib.SMTP_SSL('smtp.gmail.com', PORT, context=context, timeout=20) as server:
        print("2. Conectado! EHLO...")
        server.ehlo()
        print("3. Login...")
        server.login(USER, PASS)
        print("4. LOGIN BEM SUCEDIDO!")
        
        print("5. Enviando e-mail de teste...")
        msg = f"Subject: Teste Final\n\nEste e-mail prova que os dados no .env estao corretos."
        server.sendmail(USER, [USER], msg)
        print("6. E-MAIL ENVIADO COM SUCESSO!")

except Exception as e:
    print(f"FALHA NO TESTE BRUTO: {e}")
