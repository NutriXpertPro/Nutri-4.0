import requests

try:
    response = requests.head('http://localhost:3000/sounds/notification.mp3')
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"Content-Length: {response.headers.get('Content-Length')}")
except Exception as e:
    print(f"Error: {e}")
