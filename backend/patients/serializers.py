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
            'service_type', 'start_date', 'created_at'
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
                user = User.objects.create(
                    email=email,
                    name=user_data.get('name'),
                    gender=user_data.get('gender'),
                    user_type='paciente',
                    is_active=True
                )
                user.set_password('Mudar@123')
                user.save()
            
            # Create profile
            patient_profile = PatientProfile.objects.create(
                user=user,
                nutritionist=nutritionist,
                **validated_data
            )
            
        return patient_profile
