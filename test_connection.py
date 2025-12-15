import pymysql

# Configurações do banco de dados
host = 'localhost'
user = 'root'
password = 'NutriXpert2024'
database = 'information_schema'
port = 3306

try:
    print("Tentando conectar ao MariaDB...")
    print(f"Host: {host}, Port: {port}")
    print(f"Usuário: {user}")
    print(f"Banco de dados: {database}")
    
    connection = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        connect_timeout=10  # Timeout após 10 segundos
    )
    
    print('Conexão bem sucedida ao MariaDB!')
    
    # Criar cursor e fazer uma consulta simples
    cursor = connection.cursor()
    cursor.execute('SELECT VERSION();')
    version = cursor.fetchone()
    print(f'Versão do MariaDB: {version[0]}')
    
    # Fechar conexão
    cursor.close()
    connection.close()
    
except Exception as e:
    print(f'Falha na conexão ao MariaDB: {str(e)}')
    import traceback
    traceback.print_exc()