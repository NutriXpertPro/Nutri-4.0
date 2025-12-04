from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone, formats
from patients.models import PatientProfile
from .models import Evaluation

User = get_user_model()


class EvaluationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="nutri@test.com", password="testpass123", name="Test Nutri"
        )
        self.patient_user = User.objects.create_user(
            email="joao.silva@example.com",
            password="testpass123",
            name="João da Silva",
        )
        self.patient = PatientProfile.objects.create(
            user=self.patient_user,
            nutritionist=self.user,
        )

    def test_create_evaluation(self):
        """
        Testa a criação de uma nova avaliação para um paciente.
        """
        evaluation_date = timezone.now()
        measurements = {"waist": 90.5, "hip": 105.2, "neck": 38.1}

        evaluation = Evaluation.objects.create(
            patient=self.patient,
            weight=85.5,
            body_measurements=measurements,
            date=evaluation_date,
        )

        saved_evaluation = Evaluation.objects.get(id=evaluation.id)

        self.assertEqual(saved_evaluation.patient, self.patient)
        self.assertEqual(saved_evaluation.weight, 85.5)
        self.assertEqual(saved_evaluation.body_measurements["waist"], 90.5)
        self.assertEqual(saved_evaluation.date, evaluation_date)
        date_str = formats.date_format(evaluation_date, "d/m/Y")
        expected_str = f"Avaliação de {self.patient.user.name} em {date_str}"
        self.assertEqual(str(saved_evaluation), expected_str)
