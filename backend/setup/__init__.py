import pymysql

pymysql.install_as_MySQLdb()

# Monkey patch para compatibilidade com Django 5+
try:
    import MySQLdb
    if hasattr(MySQLdb, 'version_info'):
        MySQLdb.version_info = (2, 2, 1, 'final', 0)
except ImportError:
    pass

# Inicialização do Celery
from .celery import app as celery_app

__all__ = ('celery_app',)
