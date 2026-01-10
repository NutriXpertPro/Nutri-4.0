from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserProfile, AuthenticationLog
from utils.validators import validate_cpf
import re


User = get_user_model()

def validate_strong_password(value):
    """
    Validação adicional de força de senha
    - Pelo menos 8 caracteres
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
    - Pelo menos um caractere especial
    """
    if len(value) < 8:
        raise serializers.ValidationError("A senha deve ter pelo menos 8 caracteres.")

    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("A senha deve conter pelo menos uma letra maiúscula.")

    if not re.search(r'[a-z]', value):
        raise serializers.ValidationError("A senha deve conter pelo menos uma letra minúscula.")

    if not re.search(r'[0-9]', value):
        raise serializers.ValidationError("A senha deve conter pelo menos um número.")

    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', value):
        raise serializers.ValidationError("A senha deve conter pelo menos um caractere especial.")

    return value

def validate_password_not_email_or_name(value, email, name):
    """
    Validação para garantir que a senha não seja igual ao email ou nome
    """
    if email.lower() in value.lower() or value.lower() in email.lower():
        raise serializers.ValidationError("A senha não pode conter seu email.")

    if name.lower() in value.lower() or value.lower() in name.lower():
        raise serializers.ValidationError("A senha não pode conter seu nome.")

    return value


class NutritionistRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'confirm_password', 'professional_title', 'gender', 'cpf', 'crn')

    def validate_password(self, value):
        # Validação padrão do Django
        validate_password(value)
        # Validação adicional de força
        validate_strong_password(value)
        return value

    def validate(self, attrs):
        # Verificar se as senhas coincidem
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})

        # Verificar se a senha não é igual ao email ou nome
        email = self.initial_data.get('email', '')
        name = self.initial_data.get('name', '')
        validate_password_not_email_or_name(attrs['password'], email, name)

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            user_type='nutricionista',
            professional_title=validated_data.get('professional_title'),
            gender=validated_data.get('gender'),
            cpf=validated_data.get('cpf'),
            crn=validated_data.get('crn')
        )
        return user

class GoogleLoginSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=True)

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        # Validação padrão do Django
        validate_password(value)
        # Validação adicional de força
        validate_strong_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})

        # Obter o UID do usuário a partir do contexto
        # O UID é passado via URL, então precisamos extrair do contexto
        request = self.context.get('request')
        if request:
            # Tenta obter o uidb64 de diferentes lugares
            uidb64 = request.resolver_match.kwargs.get('uidb64') if hasattr(request, 'resolver_match') and request.resolver_match else None

            # Se não estiver nos kwargs da URL, tentar obter de outros lugares
            if not uidb64:
                # Pode estar vindo de query params ou body
                uidb64 = request.query_params.get('uid') if hasattr(request, 'query_params') else None
                if not uidb64:
                    uidb64 = request.data.get('uid') if hasattr(request, 'data') else None

            if uidb64:
                from django.utils.encoding import force_str
                from django.utils.http import urlsafe_base64_decode
                from django.contrib.auth import get_user_model
                User = get_user_model()

                try:
                    uid = force_str(urlsafe_base64_decode(uidb64))
                    user = User.objects.get(pk=uid)
                    validate_password_not_email_or_name(attrs['password'], user.email, user.name)
                except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                    # Se não for possível obter o usuário, não fazemos a validação
                    pass

        return attrs

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # A validação padrão do TokenObtainPairSerializer já lida com o USERNAME_FIELD='email'
        data = super().validate(attrs)

        # Adicionar dados extras ao token, se necessário (opcional)
        # Por exemplo, para retornar mais informações sobre o usuário no payload do token.
        # data['name'] = self.user.name
        # data['user_type'] = self.user.user_type

        return data


class UserProfileSettingsSerializer(serializers.ModelSerializer):
    """Serializer for the nested 'settings' object (read and write)."""
    class Meta:
        model = UserProfile
        fields = ('theme', 'language', 'notifications_email', 'notifications_push')


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the /users/me/ endpoint to retrieve and update user details.
    """
    settings = UserProfileSettingsSerializer(source='profile', required=False)
    avatar = serializers.ImageField(source='profile.profile_picture', read_only=True)
    profile_picture = serializers.ImageField(source='profile.profile_picture', required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'name', 'user_type', 'professional_title',
            'gender', 'avatar', 'profile_picture', 'settings', 'created_at'
        )
        read_only_fields = ('id', 'email', 'user_type', 'created_at')

    def update(self, instance, validated_data):
        # Extrair dados de perfil (incluindo profile_picture se o DRF mapeou via source)
        profile_data = validated_data.pop('profile', {})
        
        # Atualizar campos do User
        instance = super().update(instance, validated_data)
        
        # Garantir que o perfil existe
        profile, created = UserProfile.objects.get_or_create(user=instance)
        
        # Atualizar campos do perfil
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        
        profile.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # Validação padrão do Django
        validate_password(value)
        # Validação adicional de força
        validate_strong_password(value)
        return value

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Your old password was entered incorrectly. Please enter it again.")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"new_password": "The two password fields didn't match."})

        # Verificar se a nova senha é diferente da antiga
        old_password = data.get('old_password')
        new_password = data['new_password']
        if old_password and old_password == new_password:
            raise serializers.ValidationError({"new_password": "A nova senha deve ser diferente da antiga."})

        return data

    def save(self, **kwargs):
        password = self.validated_data['new_password']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user


class AuthenticationLogSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)

    class Meta:
        model = AuthenticationLog
        fields = ('user_id', 'ip_address', 'user_agent')
