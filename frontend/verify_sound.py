
import requests

try:
    url = "http://localhost:3000/sounds/notification.mp3"
    print(f"Checking {url}...")
    r = requests.head(url)
    print(f"Status: {r.status_code}")
    print(f"Content-Type: {r.headers.get('Content-Type')}")
    if r.status_code == 200:
        print("Success: File is accessible.")
    else:
        print("Error: File not found or not accessible.")
except Exception as e:
    print(f"Exception: {e}")
