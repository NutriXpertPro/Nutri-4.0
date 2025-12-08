import os
import sys
import django
import traceback

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "setup.settings")

try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

django.setup()

print("Attempting to import dashboard.urls...")
try:
    import dashboard.urls
    print("SUCCESS: dashboard.urls imported.")
except Exception:
    traceback.print_exc()

print("\nAttempting to import dashboard.views...")
try:
    import dashboard.views
    print("SUCCESS: dashboard.views imported.")
except Exception:
    traceback.print_exc()
