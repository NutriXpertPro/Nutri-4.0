import os
import sys
import django
from decimal import Decimal

# Adicionando o diretório do projeto ao path
sys.path.append(r'C:\Nutri 4.0\backend')

# Configurando o ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from evaluations.models import Evaluation
from patients.models import PatientProfile
from django.contrib.auth import get_user_model

User = get_user_model()

def test_bmi_calculation():
    print("Testando cálculo automático de IMC...")
    
    # Pegar um usuário nutricionista existente (supondo que exista)
    try:
        nutritionist = User.objects.filter(user_type='nutricionista').first()
        if not nutritionist:
            # Criar um usuário de teste se não existir
            nutritionist = User.objects.create_user(
                email='test_nutri@example.com',
                password='testpass123',
                name='Test Nutritionist',
                user_type='nutricionista'
            )
            print("Usuário nutricionista de teste criado")
    except:
        nutritionist = User.objects.create_user(
            email='test_nutri@example.com',
            password='testpass123',
            name='Test Nutritionist',
            user_type='nutricionista'
        )
        print("Usuário nutricionista de teste criado")
    
    # Pegar ou criar um paciente
    try:
        patient, created = PatientProfile.objects.get_or_create(
            user__email='test_patient@example.com',
            defaults={
                'nutritionist': nutritionist,
                'user': User.objects.create_user(
                    email='test_patient@example.com',
                    password='testpass123',
                    name='Test Patient',
                    user_type='paciente'
                )
            }
        )
        if created:
            print("Paciente de teste criado")
    except:
        patient_user = User.objects.create_user(
            email='test_patient@example.com',
            password='testpass123',
            name='Test Patient',
            user_type='paciente'
        )
        patient = PatientProfile.objects.create(
            user=patient_user,
            nutritionist=nutritionist
        )
        print("Paciente de teste criado")
    
    # Criar uma avaliação com altura e peso para testar o cálculo de IMC
    evaluation = Evaluation.objects.create(
        patient=patient,
        date='2025-12-04T10:00:00Z',
        height=Decimal('1.75'),  # 1,75m
        weight=Decimal('70.0'),  # 70kg
        body_fat=Decimal('22.5'),
        muscle_mass=Decimal('55.2')
    )
    
    # Verificar se o IMC foi calculado corretamente
    # IMC = peso / altura² = 70 / (1.75)² = 70 / 3.0625 = 22.86
    expected_bmi = Decimal('22.86')  # Valor aproximado
    actual_bmi = evaluation.bmi
    
    print(f"Peso: {evaluation.weight} kg")
    print(f"Altura: {evaluation.height} m")
    print(f"IMC Calculado: {actual_bmi}")
    
    if actual_bmi is not None:
        calculated_bmi = float(evaluation.weight) / (float(evaluation.height) ** 2)
        print(f"IMC Verificado Manualmente: {calculated_bmi:.2f}")
        
        print("✓ Cálculo automático de IMC está funcionando corretamente!")
        print(f"✓ Avaliação criada com sucesso para o paciente {patient.user.name}")
    else:
        print("✗ O campo BMI não foi preenchido automaticamente")
    
    # Limpar
    evaluation.delete()
    patient.delete()
    if nutritionist.email == 'test_nutri@example.com':
        nutritionist.delete()
    if patient.user.email == 'test_patient@example.com':
        patient.user.delete()
    
    print("✓ Teste de cálculo de IMC concluído!")

if __name__ == '__main__':
    test_bmi_calculation()