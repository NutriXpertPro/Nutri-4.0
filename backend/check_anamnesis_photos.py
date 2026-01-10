import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from anamnesis.models import Anamnesis

def check_anamnesis():
    anamneses = Anamnesis.objects.all()
    print(f"Total Anamneses: {anamneses.count()}")
    for a in anamneses:
        print(f"Patient ID: {a.patient.id} | Name: {a.nome}")
        print(f"  Frente: {a.foto_frente.name if a.foto_frente else 'None'}")
        print(f"  Lado: {a.foto_lado.name if a.foto_lado else 'None'}")
        print(f"  Costas: {a.foto_costas.name if a.foto_costas else 'None'}")

if __name__ == "__main__":
    check_anamnesis()
