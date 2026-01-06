
import smtplib
import socket
import ssl
from email.mime.text import MIMEText

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 465 # Voltando para 465 SSL para teste IPv4

def test_ipv4():
    print("--- TESTE FORCANDO IPv4 ---")
    try:
        # Forcar resolucao IPv4
        addr_info = socket.getaddrinfo('smtp.gmail.com', PORT, socket.AF_INET, socket.SOCK_STREAM)
        ipv4_addr = addr_info[0][4][0]
        print(f"IP resolvido (IPv4): {ipv4_addr}")

        msg = MIMEText('Teste via IPv4 forcado.')
        msg['Subject'] = 'Teste IPv4 Nutri 4.0'
        msg['From'] = USER
        msg['To'] = USER

        context = ssl.create_default_context()
        print("Conectando...")
        with smtplib.SMTP_SSL(ipv4_addr, PORT, context=context, timeout=10) as server:
            print("Login...")
            server.login(USER, PASS)
            print("Enviando...")
            server.send_message(msg)
            print("SUCESSO IPv4!")
    except Exception as e:
        print(f"FALHA IPv4: {e}")

if __name__ == "__main__":
    test_ipv4()
