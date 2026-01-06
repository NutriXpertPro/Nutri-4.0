
import smtplib
import ssl

HOST = 'smtp.gmail.com'
PORT = 465

print(f"Testando conexão SSL no {HOST}:{PORT}...")
try:
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(HOST, PORT, context=context, timeout=10) as server:
        print("OK: Conectado via SSL!")
        server.ehlo()
        print("OK: EHLO bem sucedido!")
except Exception as e:
    print(f"ERRO: Falha na conexão SSL: {e}")
