from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Notification

User = get_user_model()


class NotificationAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="password123", name="Test User"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create some notifications
        self.notification1 = Notification.objects.create(
            user=self.user, type="APP", message="Unread notification 1", is_read=False
        )
        self.notification2 = Notification.objects.create(
            user=self.user, type="APP", message="Read notification 1", is_read=True
        )
        self.notification3 = Notification.objects.create(
            user=self.user, type="APP", message="Unread notification 2", is_read=False
        )

    def test_list_unread_notifications_api(self):
        url = reverse("notification:notification-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            len(response.data), 2
        )  # Should only return unread notifications
        self.assertEqual(response.data[0]["message"], "Unread notification 2")
        self.assertEqual(response.data[1]["message"], "Unread notification 1")

    def test_unread_notifications_htmx_view(self):
        client = Client()
        client.login(email="test@example.com", password="password123")
        url = reverse("notification:unread_notifications_htmx")
        response = client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Unread notification 1", response.content)
        self.assertIn(b"Unread notification 2", response.content)
        self.assertNotIn(b"Read notification 1", response.content)
        self.assertIn(
            b"Notifica\xc3\xa7\xc3\xb5es N\xc3\xa3o Lidas", response.content
        )  # Check for the title in Portuguese
