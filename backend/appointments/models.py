from django.db import models
from django.conf import settings
from patients.models import PatientProfile
from utils.sanitization import sanitize_string

# Create your models here.


class Appointment(models.Model):
    """
    Representa uma consulta agendada entre um nutricionista e um paciente.
    """
    STATUS_CHOICES = [
        ('agendada', 'Agendada'),
        ('confirmada', 'Confirmada'),
        ('realizada', 'Realizada'),
        ('cancelada', 'Cancelada'),
        ('faltou', 'Faltou'),
    ]

    TYPE_CHOICES = [
        ('presencial', 'Presencial'),
        ('online', 'Online'),
        ('primeira_vez', 'Primeira Vez'),
        ('retorno', 'Retorno'),
        ('em_grupo', 'Em Grupo'),
        ('pacote', 'Pacote'),
        ('permuta', 'Permuta'),
        ('pessoal', 'Pessoal'),
        ('antropometria', 'Antropometria'),
        ('amigo', 'Amigo'),
        ('encaixe', 'Encaixe'),
        ('teste', 'Teste'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments"
    )
    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name="appointments"
    )
    date = models.DateTimeField()
    duration = models.IntegerField(
        null=True,
        blank=True,
        help_text="Duração da consulta em minutos"
    )
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='presencial',
        help_text="Tipo de consulta: presencial ou online"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='agendada',
        help_text="Status da consulta"
    )
    meeting_link = models.URLField(
        null=True,
        blank=True,
        help_text="Link para reunião online (se for consulta online)"
    )
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.notes:
            self.notes = sanitize_string(self.notes)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        """
        Retorna uma representação em string da consulta, incluindo o nome
        do paciente e a data/hora.
        """
        date_str = self.date.strftime("%d/%m/%Y %H:%M")
        return f"Consulta de {self.patient.user.name} em {date_str} ({self.get_status_display()})"
