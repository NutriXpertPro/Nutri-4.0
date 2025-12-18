from django.db import models
from django.conf import settings
from patients.models import PatientProfile


class PatientDiaryEntry(models.Model):
    """
    Modelo para entradas no diário do paciente
    """
    ENTRY_TYPES = [
        ('photo', 'Foto'),
        ('text', 'Texto'),
        ('meal', 'Refeição'),
        ('exercise', 'Exercício'),
        ('weight', 'Peso'),
        ('note', 'Observação'),
    ]
    
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='diary_entries',
        verbose_name="Paciente"
    )
    
    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPES,
        verbose_name="Tipo de Entrada"
    )
    
    title = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Título"
    )
    
    content = models.TextField(
        blank=True,
        verbose_name="Conteúdo"
    )
    
    photo = models.ImageField(
        upload_to='patient_diary_photos/',
        blank=True,
        null=True,
        verbose_name="Foto"
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Data/Hora"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Entrada no Diário"
        verbose_name_plural = "Entradas no Diário"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Entrada de {self.patient.user.name} - {self.entry_type} - {self.timestamp}"


class SocialLike(models.Model):
    """
    Modelo para curtidas em entradas do diário
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Usuário"
    )
    
    diary_entry = models.ForeignKey(
        PatientDiaryEntry,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name="Entrada do Diário"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Curtida"
        verbose_name_plural = "Curtidas"
        unique_together = ['user', 'diary_entry']  # Um usuário pode curtir uma entrada apenas uma vez
    
    def __str__(self):
        return f"{self.user.name} curtiu {self.diary_entry.id}"


class SocialComment(models.Model):
    """
    Modelo para comentários em entradas do diário
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Usuário"
    )
    
    diary_entry = models.ForeignKey(
        PatientDiaryEntry,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Entrada do Diário"
    )
    
    content = models.TextField(verbose_name="Conteúdo")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Comentário"
        verbose_name_plural = "Comentários"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comentário de {self.user.name} em {self.diary_entry.id}"