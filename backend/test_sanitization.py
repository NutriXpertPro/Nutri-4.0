import sys
import os
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from utils.sanitization import sanitize_string

name = "Angela Cristina Portes de Sant'Ana"
sanitized = sanitize_string(name)
print(f"Original: {name}")
print(f"Sanitized: {sanitized}")
print(f"Equal: {name == sanitized}")

import html
print(f"html.escape: {html.escape(name)}")
