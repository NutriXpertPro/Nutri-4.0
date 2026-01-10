import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from patients.models_patient_data import ProgressPhoto
from patients.models import PatientProfile

def check_photos():
    photos = ProgressPhoto.objects.all().order_by('patient', 'uploaded_at')
    print(f"Total Photos: {photos.count()}")
    for photo in photos:
        print(f"Patient: {photo.patient.name} (ID: {photo.patient.id}) | Angle: {photo.angle} | Date: {photo.uploaded_at} | File: {photo.photo.name}")

if __name__ == "__main__":
    check_photos()
