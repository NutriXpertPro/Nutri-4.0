
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from django.conf import settings
from django.core.mail import send_mail

def test_email():
    print("--- Testing Email Configuration ---")
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    # Check credentials (mask them)
    user = getattr(settings, 'EMAIL_HOST_USER', '')
    pwd = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    print(f"EMAIL_HOST_USER: {'Set' if user else 'NOT SET'} ({user[:3]}***)" if user else "EMAIL_HOST_USER: NOT SET")
    print(f"EMAIL_HOST_PASSWORD: {'Set' if pwd else 'NOT SET'}")

    recipient = 'test_recipient@example.com' # We won't actually send to a real person unless user specifies
    
    print(f"\nAttempting to send test email to {recipient}...")
    try:
        send_mail(
            'Test Email from Nutri 4.0 Debugger',
            'This is a test email to verify SMTP settings.',
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        print("SUCCESS: Email sent successfully (or queued if async).")
    except Exception as e:
        print(f"FAILURE: Error sending email: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    test_email()
