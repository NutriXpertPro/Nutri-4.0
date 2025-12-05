from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

User = get_user_model()

class GoogleLoginTests(APITestCase):
    def setUp(self):
        self.url = reverse('google_login')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_success_new_user(self, mock_verify):
        """
        Teste: Login com sucesso de um novo usuário (deve criar o usuário).
        """
        # Configurar o mock para retornar dados de sucesso
        mock_verify.return_value = {
            'email': 'novo.usuario@gmail.com',
            'name': 'Novo Usuário',
            'iss': 'accounts.google.com',
            'aud': 'seu-client-id'
        }

        data = {'id_token': 'fake-valid-token'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        
        # Verificar se o usuário foi criado
        self.assertTrue(User.objects.filter(email='novo.usuario@gmail.com').exists())
        user = User.objects.get(email='novo.usuario@gmail.com')
        self.assertEqual(user.user_type, 'paciente') # Default type

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_success_existing_user(self, mock_verify):
        """
        Teste: Login com sucesso de usuário existente (não deve criar duplicado).
        """
        # Criar usuário existente
        User.objects.create_user(email='existente@gmail.com', name='Existente', user_type='nutricionista')

        mock_verify.return_value = {
            'email': 'existente@gmail.com',
            'name': 'Existente Google',
            'iss': 'accounts.google.com',
            'aud': 'seu-client-id'
        }

        data = {'id_token': 'fake-valid-token'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1) # Não deve ter criado outro
        
        # Verificar se manteve o tipo original
        user = User.objects.get(email='existente@gmail.com')
        self.assertEqual(user.user_type, 'nutricionista')

    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_login_invalid_token(self, mock_verify):
        """
        Teste: Token inválido (deve retornar erro).
        """
        mock_verify.side_effect = ValueError("Token signature invalid")

        data = {'id_token': 'invalid-token'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
