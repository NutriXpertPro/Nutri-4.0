from django.db import models
from django.core.validators import FileExtensionValidator
from patients.models import PatientProfile

class LabExam(models.Model):
    """
    Representa um exame laboratorial de um paciente, incluindo o nome do exame,
    data, anexo (arquivo) e observações.
    """
    patient = models.ForeignKey(
        PatientProfile, 
        related_name='lab_exams', 
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=200, verbose_name="Nome do Exame", db_index=True) # Adicionado para performance
    date = models.DateField(verbose_name="Data do Exame")
    attachment = models.FileField(
        upload_to='lab_exams/%Y/%m/%d/',
        verbose_name="Anexo do Exame",
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])]
    )
    notes = models.TextField(null=True, blank=True, verbose_name="Observações")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Exame Laboratorial"
        verbose_name_plural = "Exames Laboratoriais"

    def __str__(self):
        """
        Retorna uma representação em string do exame, identificando o nome
        do exame, o paciente e a data.
        """
        return f"{self.name} - {self.patient.user.name} em {self.date.strftime('%d/%m/%Y')}"