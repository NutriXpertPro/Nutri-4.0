import json

class Debug400Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if response.status_code >= 400:
            print(f"\n{'!'*20} HTTP ERROR DEBUG ({response.status_code}) {'!'*20}")
            print(f"Path: {request.path}")
            print(f"Method: {request.method}")
            print(f"Content-Type: {request.content_type}")
            try:
                print(f"Body: {request.body.decode('utf-8', errors='ignore')[:1000]}")
            except:
                print("Could not read body")
            
            try:
                print(f"Response Content: {response.content.decode('utf-8')}")
            except:
                print("Could not read response content")
            print(f"{'!'*60}\n")
            
            # Also log to a file
            log_file = "c:\\Nutri 4.0\\backend\\error_diagnostics.log"
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n--- ERROR {response.status_code} ---\nPath: {request.path}\nMethod: {request.method}\nResponse: {response.content.decode('utf-8', errors='ignore')}\n")

        return response
