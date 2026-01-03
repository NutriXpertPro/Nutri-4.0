from django.test import TestCase
from django.contrib.auth import get_user_model
from ..models import PatientProfile
from unittest.mock import patch

User = get_user_model()

class PatientEmailSignalTests(TestCase):
    def setUp(self):
        self.nutritionist = User.objects.create_user(
            email='nutri@test.com',
            password='password123',
            name='Nutri Test',
            user_type='nutricionista'
        )

    @patch('patients.tasks.send_welcome_email_task.delay')
    def test_welcome_email_signal_triggered(self, mock_send_email):
        """
        Verifica se a task de envio de email é chamada quando um paciente é criado.
        """
        # Criar usuário paciente
        patient_user = User.objects.create_user(
            email='patient@test.com',
            password='password123',
            name='Patient Test',
            user_type='paciente'
        )

        # Criar perfil de paciente (isso deve disparar o sinal)
        PatientProfile.objects.create(
            user=patient_user,
            nutritionist=self.nutritionist,
            goal='PERDA_GORDURA'
        )

        # Verificar se a task foi chamada com os argumentos corretos
        mock_send_email.assert_called_once_with(patient_user.id, self.nutritionist.name)
