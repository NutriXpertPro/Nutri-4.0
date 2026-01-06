
import smtplib
import ssl
import sys
from email.mime.text import MIMEText

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 587

def debug_smtp():
    with open('smtp_debug.log', 'w') as f:
        sys.stderr = f # smtplib writes debug to stderr
        print("Iniciando teste SMTP com debug...", file=sys.stdout)
        
        try:
            msg = MIMEText('Teste de depuracao do protocolo.')
            msg['Subject'] = 'Debug SMTP Nutri 4.0'
            msg['From'] = USER
            msg['To'] = USER

            server = smtplib.SMTP('smtp.gmail.com', PORT, timeout=15)
            server.set_debuglevel(1)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(USER, PASS)
            print("Login realizado. Enviando mensagem...", file=sys.stdout)
            server.send_message(msg)
            print("Mensagem enviada!", file=sys.stdout)
            server.quit()
        except Exception as e:
            print(f"FALHA NO DEBUG: {e}", file=sys.stdout)
        finally:
            sys.stderr = sys.__stderr__

if __name__ == "__main__":
    debug_smtp()
