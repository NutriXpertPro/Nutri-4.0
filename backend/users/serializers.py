from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class NutritionistRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'confirm_password', 'professional_title', 'gender')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            user_type='nutricionista',
            professional_title=validated_data.get('professional_title'),
            gender=validated_data.get('gender')
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
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Mapeia o campo 'email' para o campo 'username' esperado pelo backend
        email = attrs.get('email')
        if email:
            attrs['username'] = email

        # Validação padrão
        data = super().validate(attrs)

        # Verifica se o usuário é um nutricionista (adicional à validação padrão)
        # O usuário está disponível após a validação bem-sucedida
        if self.user and self.user.user_type != 'nutricionista':
            raise serializers.ValidationError({"error": "Acesso negado. Esta é uma área exclusiva para nutricionistas."})

        return data
