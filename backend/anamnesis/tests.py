from django.test import TestCase
from django.contrib.auth import get_user_model
from patients.models import PatientProfile
from .models import Anamnesis

User = get_user_model()


class AnamnesisModelTest(TestCase):
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

    def test_create_anamnesis(self):
        """
        Testa a criação de uma nova anamnese para um paciente.
        """
        conditions = ["Diabetes Tipo 2", "Hipertensão"]
        allergies = ["Amendoim"]

        Anamnesis.objects.create(
            patient=self.patient,
            weight=90.0,
            height=1.75,
            medical_conditions=conditions,
            allergies=allergies,
        )

        saved_anamnesis = Anamnesis.objects.get(patient=self.patient)

        self.assertEqual(saved_anamnesis.patient, self.patient)
        self.assertEqual(saved_anamnesis.weight, 90.0)
        self.assertEqual(len(saved_anamnesis.medical_conditions), 2)
        self.assertEqual(saved_anamnesis.allergies[0], "Amendoim")
        self.assertEqual(
            str(saved_anamnesis), f"Anamnese de {self.patient.user.name}"
        )
