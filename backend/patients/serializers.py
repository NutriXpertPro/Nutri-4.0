import secrets
import string

from rest_framework import serializers
from .models import PatientProfile


from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()

class PatientProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name')
    email = serializers.EmailField(source='user.email')
    status = serializers.BooleanField(source='user.is_active', read_only=True)
    gender = serializers.ChoiceField(source='user.gender', choices=User.GENDER_CHOICES, required=False)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user_id', 'name', 'email', 'gender', 'status', 'is_active',
            'birth_date', 'phone', 'address', 'goal', 
            'service_type', 'start_date', 'created_at',
            'target_weight', 'target_body_fat'
        ]
        read_only_fields = ['user_id', 'created_at']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        nutritionist = self.context['request'].user

        with transaction.atomic():
            email = user_data.get('email')
            
            # Check if user already exists
            user = User.objects.filter(email=email).first()
            
            if user:
                # User exists. Check if they already have a profile.
                if hasattr(user, 'patient_profile'):
                    raise serializers.ValidationError(
                        {'email': 'Já existe um paciente cadastrado com este e-mail.'}
                    )
                
                # Update existing user data if needed (optional)
                user.name = user_data.get('name', user.name)
                user.gender = user_data.get('gender', user.gender)
                user.save()
            else:
                # Create new user

                # Generate a secure random password
                alphabet = string.ascii_letters + string.digits + string.punctuation
                random_password = ''.join(secrets.choice(alphabet) for i in range(16))
                
                user = User.objects.create(
                    email=email,
                    name=user_data.get('name'),
                    gender=user_data.get('gender'),
                    user_type='paciente',
                    is_active=True
                )
                user.set_password(random_password)
                user.save()
                
                # Enviar email para o paciente definir sua própria senha
                # via link de redefinição de senha.
                from django.contrib.auth.tokens import default_token_generator
                from django.utils.http import urlsafe_base64_encode
                from django.utils.encoding import force_bytes
                from django.core.mail import send_mail
                import os

                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
                reset_link = f"{frontend_url}/auth/set-password/{uid}/{token}/"

                try:
                    send_mail(
                        'Defina sua senha - NutriXpertPro',
                        f'Para definir sua senha, clique no link: {reset_link}',
                        'noreply@nutrixpert.com.br',
                        [user.email],
                        fail_silently=False,
                    )
                except Exception as e:
                    # Em caso de erro no envio de email, registrar mas continuar processo
                    print(f"Erro ao enviar email de definição de senha: {str(e)}")
                    pass  # Não interromper o processo por falha de email
            
            # Create profile
            patient_profile = PatientProfile.objects.create(
                user=user,
                nutritionist=nutritionist,
                **validated_data
            )
            
        return patient_profile
