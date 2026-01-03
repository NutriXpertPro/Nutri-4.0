from django.db import models
from django.conf import settings
from users.models import User
from utils.sanitization import sanitize_string


class UserBranding(models.Model):
    """
    Modelo para configurações de branding do usuário (nutricionista).
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='branding',
        verbose_name="Nutricionista"
    )
    
    # Personalização visual
    logo = models.ImageField(
        upload_to='branding/logos/',
        blank=True,
        null=True,
        verbose_name="Logo do Consultório"
    )
    primary_color = models.CharField(
        max_length=7,
        default='#22c55e',
        verbose_name="Cor Primária (hex)",
        help_text="Ex: #22c55e"
    )
    secondary_color = models.CharField(
        max_length=7,
        default='#059669',
        verbose_name="Cor Secundária (hex)",
        help_text="Ex: #059669"
    )
    
    # Informações de identidade
    business_name = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Nome Comercial"
    )
    crn_number = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Número do CRN"
    )
    professional_license = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Licença Profissional"
    )
    
    # Assinatura de e-mail
    email_signature = models.TextField(
        blank=True,
        verbose_name="Assinatura de E-mail"
    )
    
    # Informações de contato
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Telefone de Contato"
    )
    address = models.TextField(
        blank=True,
        verbose_name="Endereço"
    )
    
    # Personalização de documentos
    document_header = models.TextField(
        blank=True,
        verbose_name="Cabeçalho de Documentos"
    )
    document_footer = models.TextField(
        blank=True,
        verbose_name="Rodapé de Documentos"
    )
    
    # Assinatura digital (imagem)
    signature_image = models.ImageField(
        upload_to='branding/signatures/',
        blank=True,
        null=True,
        verbose_name="Assinatura Digital",
        help_text="Imagem da assinatura (PNG/JPG). O fundo será removido automaticamente."
    )
    
    # Configurações gerais
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.business_name:
            self.business_name = sanitize_string(self.business_name)
        if self.crn_number:
            self.crn_number = sanitize_string(self.crn_number)
        if self.professional_license:
            self.professional_license = sanitize_string(self.professional_license)
        if self.email_signature:
            self.email_signature = sanitize_string(self.email_signature)
        if self.phone:
            self.phone = sanitize_string(self.phone)
        if self.address:
            self.address = sanitize_string(self.address)
        if self.document_header:
            self.document_header = sanitize_string(self.document_header)
        if self.document_footer:
            self.document_footer = sanitize_string(self.document_footer)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Branding do Usuário"
        verbose_name_plural = "Brandings dos Usuários"
        ordering = ['user__name']

    def __str__(self):
        return f"Branding - {self.user.name if self.user.name else self.user.email}"