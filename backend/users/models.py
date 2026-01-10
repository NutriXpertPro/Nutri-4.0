from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import FileExtensionValidator
from django.utils.translation import gettext_lazy as _
import os
from utils.sanitization import sanitize_string

# Create your models here.


class UserManager(BaseUserManager):
    """Manager customizado para o nosso modelo de User."""

    def create_user(self, email, password=None, **extra_fields):
        """Cria e salva um novo usuário com o email e senha fornecidos."""
        if not email:
            raise ValueError("O email é um campo obrigatório.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Cria e salva um novo superusuário."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Modelo de usuário customizado que usa email como login."""

    USER_TYPE_CHOICES = (
        ("nutricionista", _("Nutricionista")),
        ("paciente", _("Paciente")),
        ("admin", _("Admin")),  # Adicionado para o superusuário
    )

    PROFESSIONAL_TITLE_CHOICES = [
        ("DR", _("Dr.")),
        ("DRA", _("Dra.")),
        ("PHD", _("PhD")),
        ("MTR", _("Mestre")),
        ("ESP", _("Especialista")),
        ("NUT", _("Nutricionista")),
    ]

    GENDER_CHOICES = [
        ("M", _("Masculino")),
        ("F", _("Feminino")),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default="paciente",  # Valor padrão para novos usuários
        db_index=True # Adicionado para performance
    )
    professional_title = models.CharField(
        max_length=3,
        choices=PROFESSIONAL_TITLE_CHOICES,
        blank=True,
        null=True,
    )
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
    )
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    crn = models.CharField(max_length=20, null=True, blank=True)
    is_staff = models.BooleanField(default=False)  # Necessário para acesso ao admin
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"  # Define o campo de login
    REQUIRED_FIELDS = ["name", "user_type"]  # user_type agora é um campo obrigatório

    def __str__(self):
        """Retorna o email do usuário como sua representação em string."""
        return self.email

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.name:
            self.name = sanitize_string(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at'] # Adicionado para ordenação padrão


def validate_image_file(value):
    """Validador para garantir que o arquivo seja uma imagem válida e seguro."""
    import os
    from PIL import Image
    from django.core.exceptions import ValidationError

    # Verificar extensão do arquivo
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']

    if ext.lower() not in valid_extensions:
        raise ValidationError('Formato de arquivo não suportado. Apenas JPG, JPEG, PNG e GIF são permitidos.')

    # Verificar tamanho do arquivo (max 5MB)
    if value.size > 5 * 1024 * 1024:  # 5MB
        raise ValidationError('O arquivo é muito grande. O tamanho máximo é 5MB.')

    # Verificar se é realmente uma imagem válida
    try:
        img = Image.open(value)
        img.verify()
    except:
        raise ValidationError('Arquivo não é uma imagem válida.')


class UserProfile(models.Model):
    """
    Modelo para armazenar informações de perfil adicionais, separado do modelo de autenticação.
    """
    THEME_CHOICES = [
        ('light', _('Claro')),
        ('dark', _('Escuro')),
    ]

    LANGUAGE_CHOICES = [
        ('pt-BR', _('Português (Brasil)')),
        ('en-US', _('Inglês (EUA)')),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True,
        verbose_name="Foto de Perfil",
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']), validate_image_file]
    )
    theme = models.CharField(
        max_length=10,
        choices=THEME_CHOICES,
        default='light',
        verbose_name="Tema"
    )
    language = models.CharField(
        max_length=5,
        choices=LANGUAGE_CHOICES,
        default='pt-BR',
        verbose_name="Idioma"
    )
    notifications_email = models.BooleanField(default=True, verbose_name="Notificações por Email")
    notifications_push = models.BooleanField(default=True, verbose_name="Notificações Push")

    def __str__(self):
        return f"Perfil de {self.user.name}"

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuários"


# Signal unificado para gerenciar o UserProfile
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def manage_user_profile(sender, instance, created, **kwargs):
    """Cria ou atualiza o perfil do usuário de forma atômica."""
    if created:
        UserProfile.objects.get_or_create(user=instance)
    else:
        # Garante que o perfil exista mesmo para usuários antigos
        if not hasattr(instance, 'profile'):
            UserProfile.objects.create(user=instance)
        else:
            instance.profile.save()


class AuthenticationLog(models.Model):
    """
    Registra tentativas de login bem-sucedidas.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="login_logs"
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Login de {self.user.email} em {self.timestamp}"

    class Meta:
        verbose_name = "Log de Autenticação"
        verbose_name_plural = "Logs de Autenticação"
        ordering = ['-timestamp']
