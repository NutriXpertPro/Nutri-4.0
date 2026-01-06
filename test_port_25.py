
import smtplib

USER = 'nutrixpertpro@gmail.com'
PASS = 'wktjgaxveewodrwt'

def test_2525():
    print("--- TESTE PORTA 2525 (Geralmente usada para bypass) ---")
    try:
        # Gmail tambem aceita 587, mas vamos testar 2525 se houver algum relay
        # Na verdade Gmail nao aceita 2525 nativamente. 
        # Vamos tentar a porta 25 (apenas para ver se o socket abre)
        print("Testando porta 25 (Gmail)...")
        server = smtplib.SMTP('smtp.gmail.com', 25, timeout=10)
        print("Conectado na 25!")
        server.quit()
    except Exception as e:
        print(f"Porta 25 falhou (esperado): {e}")

if __name__ == "__main__":
    test_2525()
