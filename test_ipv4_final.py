
import socket
import smtplib
import ssl
from email.mime.text import MIMEText

# Monkeypatch socket to only return IPv4
orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

socket.getaddrinfo = getaddrinfo_ipv4

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 465

def test_ipv4_patched():
    print("--- TESTE IPv4 COM MONKEYPATCH ---")
    try:
        msg = MIMEText('Teste final com IPv4 forcado via monkeypatch.')
        msg['Subject'] = 'Teste Real Nutri 4.0'
        msg['From'] = USER
        msg['To'] = USER

        context = ssl.create_default_context()
        print("Conectando a smtp.gmail.com...")
        with smtplib.SMTP_SSL('smtp.gmail.com', PORT, context=context, timeout=15) as server:
            print("Login...")
            server.login(USER, PASS)
            print("Enviando...")
            server.send_message(msg)
            print("SUCESSO ABSOLUTO! O e-mail foi enviado.")
    except Exception as e:
        print(f"FALHA: {e}")

if __name__ == "__main__":
    test_ipv4_patched()
