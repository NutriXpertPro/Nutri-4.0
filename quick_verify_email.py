
import smtplib
import ssl
import os

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'
PORT = 465

def quick_verify():
    print(f"Verificando login para {USER}...")
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', PORT, context=context, timeout=10) as server:
            print("Conectado SSL. Tentando login...")
            server.login(USER, PASS)
            print("LOGIN SUCESSO!")
            
            print("Enviando e-mail de prova...")
            msg = f"Subject: Nutri 4.0 - Verificacao de Email\n\nConfiguracao de email atualizada com sucesso para {USER}."
            server.sendmail(USER, [USER], msg)
            print("E-MAIL ENVIADO!")
    except Exception as e:
        print(f"FALHA: {e}")

if __name__ == "__main__":
    quick_verify()
