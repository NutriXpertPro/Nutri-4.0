import sys
import os
import html
# Mocking sanitize_string locally to test logic before modifying file
def sanitize_string_current(value):
    if not isinstance(value, str):
        return value
    dangerous_chars = '<>"'
    for char in dangerous_chars:
        value = value.replace(char, '')
    return value.strip()

def sanitize_string_proposed(value):
    if not isinstance(value, str):
        return value
    # START CHANGE
    value = html.unescape(value)
    # END CHANGE
    dangerous_chars = '<>"'
    for char in dangerous_chars:
        value = value.replace(char, '')
    return value.strip()

# Simulation
problematic_input = "Angela Cristina Portes De Sant&#x27;Ana" # Simulating what might be coming in if single-escaped
problematic_input_2 = "Angela Cristina Portes De Sant&amp;#x27;Ana" # Double escaped

print(f"Input 1: {problematic_input}")
print(f"Current 1: {sanitize_string_current(problematic_input)}")
print(f"Proposed 1: {sanitize_string_proposed(problematic_input)}")

print(f"Input 2: {problematic_input_2}")
print(f"Current 2: {sanitize_string_current(problematic_input_2)}")
print(f"Proposed 2: {sanitize_string_proposed(problematic_input_2)}")

# Test safety
malicious = "&lt;script&gt;" # <script> escaped
print(f"Malicious Input: {malicious}")
print(f"Current Malicious: {sanitize_string_current(malicious)}")
print(f"Proposed Malicious: {sanitize_string_proposed(malicious)}") 
# Unescape -> <script>. Replace < > -> script. Safe.
