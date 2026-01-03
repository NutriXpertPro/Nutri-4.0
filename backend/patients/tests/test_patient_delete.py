from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from ..models import PatientProfile
from notifications.models import Notification

User = get_user_model()

class PatientDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.nutritionist = User.objects.create_user(
            email='nutri@test.com',
            password='password123',
            name='Nutri Test',
            user_type='nutricionista'
        )
        self.client.force_authenticate(user=self.nutritionist)

        self.patient_user = User.objects.create_user(
            email='patient@test.com',
            password='password123',
            name='Patient Test',
            user_type='paciente'
        )
        self.patient = PatientProfile.objects.create(
            user=self.patient_user,
            nutritionist=self.nutritionist
        )
        
        # Criar notificação simulada de "Novo Paciente"
        self.notification = Notification.objects.create(
            user=self.nutritionist,
            title="Novo Paciente",
            message=f"Novo paciente cadastrado: {self.patient_user.name} [ID:{self.patient.id}] [PID:{self.patient.id}]",
            notification_type="system"
        )
        
        # Criar notificação não relacionada para garantir que não é deletada
        self.other_notification = Notification.objects.create(
            user=self.nutritionist,
            title="Outra Coisa",
            message="Mensagem qualquer [PID:999]",
            notification_type="system"
        )

    def test_soft_delete_removes_notification(self):
        """
        Testa se o Soft Delete remove a notificação associada.
        """
        from django.urls import reverse
        url = reverse('patients:detail_update_delete', kwargs={'pk': self.patient.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verificar se o paciente foi soft deleted
        self.patient.refresh_from_db()
        self.assertFalse(self.patient.is_active)
        
        # Verificar se a notificação foi removida
        self.assertFalse(Notification.objects.filter(id=self.notification.id).exists())
        
        # Verificar se a outra notificação permanece
        self.assertTrue(Notification.objects.filter(id=self.other_notification.id).exists())

    def test_hard_delete_removes_patient_and_notification(self):
        """
        Testa se o Hard Delete remove o paciente do banco e a notificação.
        """
        from django.urls import reverse
        url = reverse('patients:detail_update_delete', kwargs={'pk': self.patient.id}) + '?hard_delete=true'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verificar se o paciente foi removido do banco
        self.assertFalse(PatientProfile.objects.filter(id=self.patient.id).exists())
        
        # Verificar se a notificação foi removida
        self.assertFalse(Notification.objects.filter(id=self.notification.id).exists())
