from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from ..models import PatientProfile

User = get_user_model()

class PatientAPITests(APITestCase):

    def setUp(self):
        self.nutritionist = User.objects.create_user(
            email='nutri@example.com',
            password='testpassword',
            name='Test Nutri',
            user_type='nutricionista'
        )
        self.client.force_authenticate(user=self.nutritionist)

        self.patient1 = User.objects.create_user(
            email='patient1@example.com',
            password='testpassword',
            name='Patient One',
            user_type='paciente'
        )
        self.patient_profile1 = PatientProfile.objects.create(
            user=self.patient1,
            nutritionist=self.nutritionist,
            goal='PERDA_PESO'
        )

        self.patient2 = User.objects.create_user(
            email='patient2@example.com',
            password='testpassword',
            name='Patient Two',
            user_type='paciente'
        )
        self.patient_profile2 = PatientProfile.objects.create(
            user=self.patient2,
            nutritionist=self.nutritionist,
            goal='GANHO_MUSCULAR'
        )

        self.inactive_patient = User.objects.create_user(
            email='inactive@example.com',
            password='testpassword',
            name='Inactive Patient',
            user_type='paciente'
        )
        self.inactive_patient_profile = PatientProfile.objects.create(
            user=self.inactive_patient,
            nutritionist=self.nutritionist,
            is_active=False
        )

    def test_soft_delete_patient(self):
        """
        Ensure a patient can be soft deleted.
        """
        url = reverse('patients:detail_update_delete', kwargs={'pk': self.patient_profile1.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        self.patient_profile1.refresh_from_db()
        self.assertFalse(self.patient_profile1.is_active)

    def test_list_patients_only_active(self):
        """
        Ensure only active patients are listed.
        """
        url = reverse('patients:list_create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2) # patient1 and patient2, not inactive_patient
        self.assertEqual(len(response.data['results']), 2) 

    def test_list_patients_pagination(self):
        """
        Ensure patient list is paginated.
        """
        # Create more patients to test pagination (already 2 active patients)
        for i in range(9): # create 9 more to make it 11, so it overflows 1 page
            user = User.objects.create_user(
                email=f'patient_page{i}@example.com',
                password='testpassword',
                name=f'Patient Page {i}',
                user_type='paciente'
            )
            PatientProfile.objects.create(
                user=user,
                nutritionist=self.nutritionist,
                goal='MANUTENCAO_PESO'
            )
        
        url = reverse('patients:list_create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        self.assertEqual(len(response.data['results']), 10) # Default PAGE_SIZE is 10
        self.assertEqual(response.data['count'], 11) # 2 initial + 9 new

    def test_list_patients_filter_by_search(self):
        """
        Ensure patients can be filtered by search query.
        """
        url = reverse('patients:list_create')
        response = self.client.get(url + '?search=One')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Patient One')

        response = self.client.get(url + '?search=Two')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Patient Two')

        response = self.client.get(url + '?search=Inactive') # Should not find inactive patient
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_retrieve_inactive_patient(self):
        """
        Ensure an inactive patient cannot be retrieved by detail view (returns 404).
        """
        url = reverse('patients:detail_update_delete', kwargs={'pk': self.inactive_patient_profile.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_retrieve_active_patient(self):
        """
        Ensure an active patient can be retrieved.
        """
        url = reverse('patients:detail_update_delete', kwargs={'pk': self.patient_profile1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Patient One')
