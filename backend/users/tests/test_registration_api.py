from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class NutritionistRegistrationTests(APITestCase):
    def test_register_nutritionist_success(self):
        url = reverse('nutricionista_register')
        data = {
            "name": "Dr. Teste",
            "email": "teste@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "professional_title": "DR",
            "gender": "M"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'teste@example.com')
        self.assertEqual(User.objects.get().user_type, 'nutricionista')
        self.assertIn('access', response.data['tokens'])

    def test_register_nutritionist_password_mismatch(self):
        url = reverse('nutricionista_register')
        data = {
            "name": "Dr. Teste",
            "email": "teste@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "WrongPassword",
            "professional_title": "DR",
            "gender": "M"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_register_nutritionist_duplicate_email(self):
        User.objects.create_user(email="teste@example.com", password="password", name="Existing")
        url = reverse('nutricionista_register')
        data = {
            "name": "Dr. Teste",
            "email": "teste@example.com",
            "password": "StrongPassword123!",
            "confirm_password": "StrongPassword123!",
            "professional_title": "DR",
            "gender": "M"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
