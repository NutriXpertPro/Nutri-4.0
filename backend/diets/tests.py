from django.test import TestCase
from django.contrib.auth import get_user_model
from patients.models import PatientProfile
from .models import Diet

User = get_user_model()


class DietModelTest(TestCase):
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

    def test_create_diet(self):
        """
        Testa a criação de uma nova dieta para um paciente.
        """
        meals_data = [
            {"id": 1, "time": "08:00", "items": ["Ovos mexidos", "Pão integral"]},
            {
                "id": 2,
                "time": "12:30",
                "items": ["Frango grelhado", "Arroz integral", "Salada"],
            },
        ]

        diet = Diet.objects.create(
            patient=self.patient, name="Dieta de Emagrecimento", meals=meals_data
        )

        saved_diet = Diet.objects.get(id=diet.id)

        self.assertEqual(saved_diet.name, "Dieta de Emagrecimento")
        self.assertEqual(saved_diet.patient, self.patient)
        self.assertEqual(len(saved_diet.meals), 2)
        self.assertEqual(saved_diet.meals[0]["items"], ["Ovos mexidos", "Pão integral"])
        self.assertEqual(
            str(saved_diet),
            f"Dieta de Emagrecimento - {self.patient.user.name}",
        )
