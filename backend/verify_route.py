import requests
import sys

url = "http://localhost:8000/api/v1/diets/foods/?search=arroz"
print(f"Checking URL: {url}")

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
