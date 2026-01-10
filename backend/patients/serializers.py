import secrets
import string

from rest_framework import serializers
from .models import PatientProfile


from django.db import transaction
from django.contrib.auth import get_user_model
from users.models import UserProfile

User = get_user_model()
import html
from utils.sanitization import sanitize_string

def file_log(msg):
    try:
        with open('email_debug.log', 'a', encoding='utf-8') as f:
            from datetime import datetime
            f.write(f"[{datetime.now()}] {msg}\n")
    except:
        pass

class PatientProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name')
    email = serializers.EmailField(source='user.email')
    status = serializers.BooleanField(source='user.is_active', read_only=True)
    gender = serializers.ChoiceField(source='user.gender', choices=User.GENDER_CHOICES, required=False)
    avatar = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(source='user.profile.profile_picture', required=False, allow_null=True, write_only=True)
    age = serializers.IntegerField(source='get_age', read_only=True)
    weight = serializers.SerializerMethodField()
    height = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(read_only=True)

    nutritionist_name = serializers.SerializerMethodField()
    nutritionist_title = serializers.SerializerMethodField()
    nutritionist_gender = serializers.SerializerMethodField()
    nutritionist_avatar = serializers.SerializerMethodField()
    anamnesis = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user_id', 'name', 'email', 'gender', 'status', 'is_active',
            'birth_date', 'phone', 'address', 'goal', 
            'service_type', 'start_date', 'created_at',
            'target_weight', 'target_body_fat', 'avatar', 'profile_picture', 'age', 'weight', 'height',
            'nutritionist_name', 'nutritionist_title', 'nutritionist_gender', 'nutritionist_avatar',
            'anamnesis'
        ]
        read_only_fields = ['user_id', 'created_at']

    def get_anamnesis(self, obj):
        """Retorna informações resumidas da anamnese para o dashboard."""
        try:
            # Tentar pegar a anamnese padrão (OneToOne)
            if hasattr(obj, 'anamnesis'):
                return {
                    'template_title': 'Anamnese Padrão',
                    'filled_date': obj.anamnesis.updated_at
                }
            
            # Se não houver, tentar pegar a resposta de template mais recente
            # Nota: responses é o related_name de AnamnesisResponse para PatientProfile
            last_response = obj.responses.order_by('-filled_date').first()
            if last_response:
                return {
                    'template_title': last_response.template.title,
                    'filled_date': last_response.filled_date
                }
        except Exception:
            pass
        return None


    def get_nutritionist_name(self, obj):
        return obj.nutritionist.name

    def get_nutritionist_title(self, obj):
        if obj.nutritionist.professional_title:
            return obj.nutritionist.get_professional_title_display()
        return "Nutricionista"

    def get_nutritionist_gender(self, obj):
        return obj.nutritionist.gender

    def get_nutritionist_avatar(self, obj):
        try:
            if hasattr(obj.nutritionist, 'profile') and obj.nutritionist.profile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.nutritionist.profile.profile_picture.url)
                return obj.nutritionist.profile.profile_picture.url
        except Exception:
            pass
        return None

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

    def get_weight(self, obj):
        """Retorna o peso da avaliação mais recente ou da anamnese se não houver avaliações."""
        active_evaluation = obj.active_evaluation
        if active_evaluation and active_evaluation.weight:
            return active_evaluation.weight
        
        # Fallback para anamnese padrão
        if hasattr(obj, 'anamnesis') and obj.anamnesis.peso:
            return obj.anamnesis.peso
        return None

    def get_height(self, obj):
        """Retorna a altura da avaliação mais recente ou da anamnese se não houver avaliações."""
        active_evaluation = obj.active_evaluation
        if active_evaluation and active_evaluation.height:
            return active_evaluation.height
            
        # Fallback para anamnese padrão
        if hasattr(obj, 'anamnesis') and obj.anamnesis.altura:
            return obj.anamnesis.altura
        return None

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        # Obter o nutricionista do contexto com proteção
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError({'error': 'Contexto de requisição inválido - usuário não encontrado'})
        nutritionist = request.user
        
        # Remover nutritionist do validated_data para evitar erro de múltiplos valores
        validated_data.pop('nutritionist', None)

        # Variáveis para controlar o envio de email DEPOIS da transação
        should_send_email = False
        email_user_id = None
        email_nutritionist_name = None
        patient_profile = None

        with transaction.atomic():
            email = user_data.get('email')
            file_log(f"[SERIALIZER] Iniciando create para {email}")
            raw_name = user_data.get('name', '')
            file_log(f"[DEBUG-NAME] RAW: {repr(raw_name)}")
            # Usa a sanitização centralizada que agora lida com deep unescape
            # Removido .title() pois o usuário deve ter controle sobre a capitalização do nome
            name = sanitize_string(raw_name)
            file_log(f"[DEBUG-NAME] SANITIZED: {repr(name)}")


            
            user = User.objects.filter(email=email).first()
            
            if user:
                if hasattr(user, 'patient_profile'):
                    profile = user.patient_profile
                    if not profile.is_active:
                        profile.is_active = True
                        profile.nutritionist = nutritionist
                        for attr, value in validated_data.items():
                            setattr(profile, attr, value)
                        profile.save()
                        
                        profile_data = user_data.get('profile', {})
                        if 'profile_picture' in profile_data:
                            from users.models import UserProfile
                            user_profile, _ = UserProfile.objects.get_or_create(user=user)
                            user_profile.profile_picture = profile_data['profile_picture']
                            user_profile.save()
                        
                        # Marcar para enviar email APÓS a transação
                        should_send_email = True
                        email_user_id = user.id
                        email_nutritionist_name = nutritionist.name
                        patient_profile = profile
                        file_log(f"[SERIALIZER] Reativação salva para {email}, email será enviado após commit")
                        # NÃO retornamos aqui, deixamos sair do bloco atomic primeiro
                    else:
                        raise serializers.ValidationError(
                            {'email': 'Já existe um paciente cadastrado com este e-mail.'}
                        )
                else:
                    user.name = name if name else user.name
                    user.gender = user_data.get('gender', user.gender)
                    user.save()
            else:
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
                
                file_log(f"[SERIALIZER] Novo usuário salvo para {email}, email será enviado via Signal")
            
            if patient_profile is None:
                patient_profile = PatientProfile.objects.create(
                    user=user,
                    nutritionist=nutritionist,
                    **validated_data
                )

                profile_data = user_data.get('profile', {})
                if 'profile_picture' in profile_data:
                    from users.models import UserProfile
                    user_profile, _ = UserProfile.objects.get_or_create(user=user)
                    user_profile.profile_picture = profile_data['profile_picture']
                    user_profile.save()
        
        # *** ENVIAR EMAIL FORA DA TRANSAÇÃO ***
        if should_send_email and email_user_id:
            try:
                from .tasks import send_welcome_email_task
                file_log(f"[SERIALIZER] Disparando task de email para user_id={email_user_id}")
                send_welcome_email_task.delay(email_user_id, email_nutritionist_name)
                file_log(f"[SERIALIZER] Task de email disparada com sucesso!")
            except Exception as e:
                file_log(f"[SERIALIZER] Erro ao disparar task: {e}")
            
        return patient_profile


    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        profile_data = user_data.pop('profile', {})
        
        # Atualizar dados do usuário (User)
        user = instance.user
        if 'name' in user_data:
            # Aplicar sanitização na atualização também (removido .title())
            user.name = sanitize_string(user_data['name'])
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
