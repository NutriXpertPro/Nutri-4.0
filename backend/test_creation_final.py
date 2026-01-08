
import os
import django
import sys
import html

# Setup
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.contrib.auth import get_user_model
from utils.sanitization import sanitize_string

User = get_user_model()

def test_creation(raw_name):
    print(f"\nTesting with: {repr(raw_name)}")
    
    # Logic from Serializer
    sanitized = sanitize_string(raw_name)
    title_name = sanitized.title()
    print(f"Sanitized: {repr(sanitized)}")
    print(f"After Title: {repr(title_name)}")
    
    # Simulating the save process
    # User.save calls sanitize_string again
    final_name = sanitize_string(title_name)
    print(f"Final (before DB): {repr(final_name)}")
    
    return final_name

inputs = [
    "Angela Cristina Portes de Sant'Ana",
    "Angela Cristina Portes De Sant&#x27;Ana",
    "Angela Cristina Portes De Sant&amp;#x27;Ana"
]

for i in inputs:
    test_creation(i)
