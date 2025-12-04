from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from patients.models import PatientProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Deletes test data including Angela Portes and previously created test users.'

    def handle(self, *args, **kwargs):
        self.stdout.write('Attempting to delete test data...')

        # Delete Angela Portes user
        try:
            angela_user = User.objects.get(email='portes.angela09@gmail.com')
            angela_user.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted user: {angela_user.email}"))
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING("User 'portes.angela09@gmail.com' not found."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error deleting user 'portes.angela09@gmail.com': {e}"))

        # Delete previously created test nutritionist
        try:
            nutri_user = User.objects.get(email='nutri@test.com')
            nutri_user.delete()
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted user: {nutri_user.email}"))
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING("User 'nutri@test.com' not found."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error deleting user 'nutri@test.com': {e}"))

        # Delete previously created test patient (pk=1)
        try:
            patient_user = User.objects.get(email='paciente1@test.com')
            patient_user.delete() # This should cascade delete PatientProfile
            self.stdout.write(self.style.SUCCESS(f"Successfully deleted user: {patient_user.email}"))
        except User.DoesNotExist:
            self.stdout.write(self.style.WARNING("User 'paciente1@test.com' not found."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error deleting user 'paciente1@test.com': {e}"))

        self.stdout.write(self.style.SUCCESS('Test data deletion attempt complete.'))
