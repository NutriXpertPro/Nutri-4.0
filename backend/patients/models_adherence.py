from django.db import models
from patients.models import PatientProfile


class AdherenceRecord(models.Model):
    """
    Modelo para registrar a adesão do paciente a uma dieta ou plano de tratamento
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='adherence_records',
        verbose_name="Paciente"
    )

    date = models.DateField(
        verbose_name="Data",
        help_text="Data da medição de adesão"
    )

    adherence_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Taxa de Adesão",
        help_text="Taxa de adesão em porcentagem (0.00 a 100.00)"
    )

    notes = models.TextField(
        blank=True,
        verbose_name="Notas"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        verbose_name = "Registro de Adesão"
        verbose_name_plural = "Registros de Adesão"
        unique_together = ['patient', 'date']  # Um registro por paciente por dia
        ordering = ['-date']

    def __str__(self):
        return f"Adesão de {self.patient.user.name} em {self.date}: {self.adherence_rate}%"