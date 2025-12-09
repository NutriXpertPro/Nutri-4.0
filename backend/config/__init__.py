import sys

# Forçar o uso do conector MariaDB em vez do mysqlclient
try:
    import mariadb
    import types

    # Criar um módulo falso para MySQLdb
    mysqlclient_fake_module = types.ModuleType('MySQLdb')
    mysqlclient_fake_module.connect = mariadb.connect
    mysqlclient_fake_module.Connection = mariadb.Connection
    mysqlclient_fake_module cursors = mariadb

    # Criar submódulos necessários
    connections_module = types.ModuleType('MySQLdb.connections')
    connections_module.Connection = mariadb.Connection
    converters_module = types.ModuleType('MySQLdb.converters')
    cursors_module = types.ModuleType('MySQLdb.cursors')
    exceptions_module = types.ModuleType('MySQLdb._exceptions')

    mysqlclient_fake_module.connections = connections_module
    mysqlclient_fake_module.converters = converters_module
    mysqlclient_fake_module.cursors = cursors_module
    mysqlclient_fake_module._exceptions = exceptions_module

    # Instalar no sys.modules
    sys.modules['MySQLdb'] = mysqlclient_fake_module
    sys.modules['MySQLdb.connections'] = connections_module
    sys.modules['MySQLdb.converters'] = converters_module
    sys.modules['MySQLdb.cursors'] = cursors_module
    sys.modules['MySQLdb._exceptions'] = exceptions_module
except ImportError:
    import pymysql
    pymysql.install_as_MySQLdb()