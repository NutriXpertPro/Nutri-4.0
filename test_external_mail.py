
import smtplib
import ssl
from email.mime.text import MIMEText

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 465

def test_external():
    print("--- TESTE PARA DESTINATARIO EXTERNO (HOTMAIL) ---")
    try:
        msg = MIMEText('Teste final para validar o fluxo de e-mail.')
        msg['Subject'] = 'Validacao Nutri 4.0'
        msg['From'] = USER
        msg['To'] = 'anderson_28vp@hotmail.com'

        context = ssl.create_default_context()
        print("Conectando porta 465...")
        with smtplib.SMTP_SSL('smtp.gmail.com', PORT, context=context, timeout=15) as server:
            print("Login...")
            server.login(USER, PASS)
            print("Enviando...")
            server.send_message(msg)
            print("SUCESSO! O e-mail foi enviado para o Hotmail.")
    except Exception as e:
        print(f"FALHA: {e}")

if __name__ == "__main__":
    test_external()
