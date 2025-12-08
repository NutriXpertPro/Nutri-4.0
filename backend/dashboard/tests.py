from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from patients.models import PatientProfile
from appointments.models import Appointment
from django.utils import timezone

User = get_user_model()

class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.nutri = User.objects.create_user(
            email='nutri@test.com', 
            password='testpassword',
            name='Dr. Test',
            user_type='nutricionista'
        )
        self.client.force_authenticate(user=self.nutri)

        self.patient_user = User.objects.create_user(
            email='patient@test.com', 
            password='testpassword',
            name='Patient Test'
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            nutritionist=self.nutri
        )

        Appointment.objects.create(
            user=self.nutri,
            patient=self.patient_profile,
            date=timezone.now()
        )

    def test_stats(self):
        response = self.client.get('/api/v1/dashboard/stats/')
        self.assertEqual(response.status_code, 200)

    def test_appointments_today(self):
        response = self.client.get('/api/v1/dashboard/appointments/today/')
        self.assertEqual(response.status_code, 200)

    def test_featured_patient(self):
        response = self.client.get('/api/v1/dashboard/patients/featured/')
        self.assertEqual(response.status_code, 200)
