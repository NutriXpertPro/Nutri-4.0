import os
import sys
import django
from django.conf import settings

# Adicionar o diretório do projeto ao path
sys.path.append('C:\\Nutri 4.0\\backend')

# Configurar o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Configurar o django
django.setup()

print('Nome do banco de dados configurado:', settings.DATABASES['default']['NAME'])
print('Usuário do banco de dados:', settings.DATABASES['default']['USER'])
print('Host do banco de dados:', settings.DATABASES['default']['HOST'])
print('Porta do banco de dados:', settings.DATABASES['default']['PORT'])
print('Engine do banco de dados:', settings.DATABASES['default']['ENGINE'])