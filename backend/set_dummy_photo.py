import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from users.models import User, UserProfile
from django.conf import settings

# Caminho para uma imagem dummy ou usar a logo do sistema como teste
dummy_pic_path = os.path.join(settings.BASE_DIR, 'media', 'branding', 'logo.png') # Usar algo que existe

if not os.path.exists(dummy_pic_path):
    print("Logo not found, trying to find any image...")
    # Tenta encontrar qualquer imagem no projeto para usar de teste
    import glob
    imgs = glob.glob(str(settings.BASE_DIR) + "/**/*.png", recursive=True)
    if imgs:
        dummy_pic_path = imgs[0]
    else:
        print("No images found to use as dummy.")
        exit(1)

print(f"Using {dummy_pic_path} as dummy photo.")

# Definir para o nutricionista
user = User.objects.filter(email='andersoncarlosvp@gmail.com').first()
if user:
    profile, _ = UserProfile.objects.get_or_create(user=user)
    with open(dummy_pic_path, 'rb') as f:
        profile.profile_picture.save('dummy_profile.png', File(f), save=True)
    print(f"Successfully set profile picture for Nutritionist: {user.email}")

# Definir para o paciente
patient_user = User.objects.filter(email='anderson_28vp@hotmail.com').first()
if patient_user:
    profile, _ = UserProfile.objects.get_or_create(user=patient_user)
    with open(dummy_pic_path, 'rb') as f:
        profile.profile_picture.save('dummy_patient_profile.png', File(f), save=True)
    print(f"Successfully set profile picture for Patient: {patient_user.email}")
else:
    print("Patient user not found.")
