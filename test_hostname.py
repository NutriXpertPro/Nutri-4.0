
import smtplib
from email.mime.text import MIMEText

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 587

def test_hostname():
    print("--- TESTE COM local_hostname ---")
    try:
        msg = MIMEText('Teste com hostname customizado.')
        msg['Subject'] = 'Teste Hostname'
        msg['From'] = USER
        msg['To'] = USER

        print("Conectando...")
        # Usar um hostname que pareca real
        server = smtplib.SMTP('smtp.gmail.com', PORT, local_hostname='nutrixpertpro.com', timeout=15)
        print("EHLO...")
        server.ehlo()
        print("STARTTLS...")
        server.starttls()
        print("Login...")
        server.login(USER, PASS)
        print("Enviando...")
        server.send_message(msg)
        print("SUCESSO!")
        server.quit()
    except Exception as e:
        print(f"FALHA: {e}")

if __name__ == "__main__":
    test_hostname()
