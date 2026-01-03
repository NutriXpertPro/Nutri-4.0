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
    avatar = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(source='user.profile.profile_picture', required=False, allow_null=True, write_only=True)
    age = serializers.IntegerField(source='get_age', read_only=True)
    weight = serializers.DecimalField(source='active_evaluation.weight', max_digits=5, decimal_places=2, read_only=True)
    height = serializers.DecimalField(source='active_evaluation.height', max_digits=5, decimal_places=2, read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user_id', 'name', 'email', 'gender', 'status', 'is_active',
            'birth_date', 'phone', 'address', 'goal', 
            'service_type', 'start_date', 'created_at',
            'target_weight', 'target_body_fat', 'avatar', 'profile_picture', 'age', 'weight', 'height'
        ]
        read_only_fields = ['user_id', 'created_at']

    def get_avatar(self, obj):
        try:
            if hasattr(obj.user, 'profile') and obj.user.profile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.user.profile.profile_picture.url)
                return obj.user.profile.profile_picture.url
        except Exception:
            pass
        return None

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        # Obter o nutricionista do contexto com proteção
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError({'error': 'Contexto de requisição inválido - usuário não encontrado'})
        nutritionist = request.user
        
        # Remover nutritionist do validated_data para evitar erro de múltiplos valores
        # pois a view passa nutritionist no save(), mas já o pegamos do request
        validated_data.pop('nutritionist', None)

        with transaction.atomic():
            email = user_data.get('email')
            # Padronizar nome para Title Case (ex: "joao silva" -> "Joao Silva")
            name = user_data.get('name', '').title()
            
            # Check if user already exists
            user = User.objects.filter(email=email).first()
            
            if user:
                # User exists. Check if they already have a profile.
                if hasattr(user, 'patient_profile'):
                    raise serializers.ValidationError(
                        {'email': 'Já existe um paciente cadastrado com este e-mail.'}
                    )
                
                # Update existing user data if needed (optional)
                user.name = name if name else user.name
                user.gender = user_data.get('gender', user.gender)
                user.save()
            else:
                # Create new user

                # Generate a secure random password
                alphabet = string.ascii_letters + string.digits + string.punctuation
                random_password = ''.join(secrets.choice(alphabet) for i in range(16))
                
                user = User.objects.create(
                    email=email,
                    name=name,
                    gender=user_data.get('gender'),
                    user_type='paciente',
                    is_active=True
                )
                user.set_password(random_password)
                user.save()
                
                # Enviar e-mail de boas-vindas assincronamente
                try:
                    from .tasks import send_welcome_email_task
                    send_welcome_email_task.delay(user.id, nutritionist.name)
                except Exception as e:
                    # Não bloquear a criação se falhar o envio da task
                    print(f"Erro ao agendar envio de email: {e}")
                pass
            
            # Create profile
            patient_profile = PatientProfile.objects.create(
                user=user,
                nutritionist=nutritionist,
                **validated_data
            )

            # Lidar com o upload da foto se houver
            profile_data = user_data.get('profile', {})
            if 'profile_picture' in profile_data:
                user_profile, _ = UserProfile.objects.get_or_create(user=user)
                user_profile.profile_picture = profile_data['profile_picture']
                user_profile.save()
            
        return patient_profile

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        profile_data = user_data.pop('profile', {})
        
        # Atualizar dados do usuário (User)
        user = instance.user
        if 'name' in user_data:
            user.name = user_data['name']
        if 'email' in user_data:
            user.email = user_data['email']
        if 'gender' in user_data:
            user.gender = user_data['gender']
        user.save()

        # Atualizar foto do perfil (UserProfile)
        if 'profile_picture' in profile_data:
            user_profile, _ = UserProfile.objects.get_or_create(user=user)
            user_profile.profile_picture = profile_data['profile_picture']
            user_profile.save()

        # Atualizar campos do PatientProfile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
