
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 465

def refined_verify():
    print(f"--- TESTE REFINADO PARA {USER} ---")
    try:
        msg = MIMEMultipart()
        msg['From'] = USER
        msg['To'] = USER # Testando para si mesmo primeiro
        msg['Subject'] = 'Teste Tecnico Nutri 4.0'
        msg.attach(MIMEText('Corpo do e-mail de teste.', 'plain'))

        context = ssl.create_default_context()
        print("1. Conectando via SSL...")
        with smtplib.SMTP_SSL('smtp.gmail.com', PORT, context=context, timeout=15) as server:
            print("2. Login...")
            server.login(USER, PASS)
            print("3. Enviando e-mail...")
            server.send_message(msg)
            print("4. SUCESSO! E-mail enviado.")
    except Exception as e:
        print(f"FALHA: {type(e).__name__}: {e}")

if __name__ == "__main__":
    refined_verify()
