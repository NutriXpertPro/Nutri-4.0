from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core import mail

User = get_user_model()

from django.test import override_settings

@override_settings(SECURE_SSL_REDIRECT=False)
class AuthFlowTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('users:nutricionista_register')
        self.login_url = reverse('users:nutricionista_login')
        self.logout_url = reverse('users:logout')
        self.password_reset_url = reverse('users:password_reset')
        
        self.user_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'professional_title': 'DR',
            'gender': 'M'
        }
        
        # Create user
        response = self.client.post(self.register_url, self.user_data, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Registration Failed: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.user = User.objects.get(email='test@example.com')

    def test_logout_blacklist(self):
        # 1. Login to get tokens
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        refresh_token = response.data['refresh']
        access_token = response.data['access']

        # 2. Logout with refresh token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_data = {'refresh': refresh_token}
        response = self.client.post(self.logout_url, logout_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Try to use refresh token (should fail if blacklisted)
        from rest_framework_simplejwt.serializers import TokenRefreshSerializer
        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
            self.fail("Refresh token should be blacklisted")
        except Exception:
            pass # Expected failure

    def test_password_reset_flow(self):
        # 1. Request Password Reset
        reset_data = {'email': self.user_data['email']}
        response = self.client.post(self.password_reset_url, reset_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that email was sent
        self.assertEqual(len(mail.outbox), 1)
        email_body = mail.outbox[0].body
        
        # Extract UID and Token from email link
        # Link format: .../reset-password/<uidb64>/<token>/
        import re
        print(f"DEBUG EMAIL BODY: {email_body}")  # Debug
        match = re.search(r'reset-password/([^/]+)/([^/]+)/', email_body)
        self.assertTrue(match, f"URL pattern not found in email: {email_body}")
        uidb64 = match.group(1)
        token = match.group(2)
        
        # 2. Confirm Password Reset
        confirm_url = reverse('users:password_reset_confirm', args=[uidb64, token])
        new_password_data = {
            'token': token,
            'password': 'NewStrongPassword456!',
            'confirm_password': 'NewStrongPassword456!'
        }
        response = self.client.post(confirm_url, new_password_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Login with NEW password
        login_data = {
            'email': self.user_data['email'],
            'password': 'NewStrongPassword456!'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Login with OLD password (should fail)
        login_data_old = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data_old, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
