
import smtplib
from email.mime.text import MIMEText

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 587

def test_587():
    print(f"--- TESTE PORTA 587 (STARTTLS) ---")
    try:
        msg = MIMEText('Teste via porta 587.')
        msg['Subject'] = 'Teste 587'
        msg['From'] = USER
        msg['To'] = USER

        print("1. Conectando...")
        server = smtplib.SMTP('smtp.gmail.com', PORT, timeout=10)
        print("2. EHLO...")
        server.ehlo()
        print("3. STARTTLS...")
        server.starttls()
        print("4. EHLO pos-TLS...")
        server.ehlo()
        print("5. Login...")
        server.login(USER, PASS)
        print("6. Enviando...")
        server.send_message(msg)
        print("7. SUCESSO!")
        server.quit()
    except Exception as e:
        print(f"FALHA 587: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test_587()
