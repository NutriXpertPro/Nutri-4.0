from django.db import models
from django.utils import formats
from patients.models import PatientProfile
from django.core.exceptions import ValidationError # Importar ValidationError

# Validador de esquema JSON
def validate_body_measurements_schema(value):
    """
    Valida o esquema JSON para o campo 'body_measurements'.
    Espera um dicionário onde as chaves são nomes de medidas (string)
    e os valores são números (int ou float).
    """
    if not isinstance(value, dict):
        raise ValidationError("Body measurements deve ser um objeto (dicionário).")
    for key, val in value.items():
        if not isinstance(key, str):
            raise ValidationError("As chaves das medidas corporais devem ser strings.")
        if not isinstance(val, (int, float)):
            raise ValidationError("Os valores das medidas corporais devem ser números.")


class Evaluation(models.Model):
    """
    Representa uma avaliação física de um paciente, contendo medidas
    antropométricas e de composição corporal.
    """
    METHOD_CHOICES = [
        ('ADIPOMETRO', 'Adipômetro'),
        ('BIOIMPEDANCIA', 'Bioimpedância'),
        ('FITA_METRICA', 'Fita Métrica (Método da Marinha)'),
    ]

    patient = models.ForeignKey(
        PatientProfile, on_delete=models.CASCADE, related_name="evaluations", null=True
    )
    date = models.DateTimeField()
    
    # New fields
    method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
        null=True,
        blank=True,
        db_index=True # Added for performance
    )
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Altura em metros (ex: 1.75)")
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Peso em kg (ex: 70.5)")
    body_fat = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="Percentual de gordura (ex: 22.5)")
    muscle_mass = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Massa muscular em kg (ex: 55.2)")

    body_measurements = models.JSONField(null=True, blank=True, help_text="Medidas corporais em JSON (circunferências, dobras cutâneas, etc.)", validators=[validate_body_measurements_schema]) # Adicionado validador
    created_at = models.DateTimeField(auto_now_add=True)

    # Campo para IMC (índice de massa corporal) calculado automaticamente
    bmi = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True,
                              help_text="IMC calculado automaticamente a partir de peso e altura")

    class Meta:
        # Ordena as avaliações da mais recente para a mais antiga por padrão
        ordering = ["-date"]

    def save(self, *args, **kwargs):
        # Calcular automaticamente o IMC se altura e peso forem fornecidos
        if self.height and self.weight and float(self.height) > 0:
            self.bmi = float(self.weight) / (float(self.height) ** 2)
        super().save(*args, **kwargs)

    def __str__(self):
        """
        Retorna uma representação em string da avaliação, identificando o
        paciente e a data.
        """
        date_str = formats.date_format(self.date, "d/m/Y")
        return f"Avaliação de {self.patient.user.name} em {date_str}"


class EvaluationPhoto(models.Model):
    """
    Armazena uma foto associada a uma avaliação física, com um rótulo
    para identificar a pose (frente, lado, costas).
    """
    LABEL_CHOICES = [
        ('FRENTE', 'Frente'),
        ('LADO', 'Lado'),
        ('COSTAS', 'Costas'),
    ]
    evaluation = models.ForeignKey(Evaluation, related_name='photos', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='evaluation_photos/%Y/%m/%d/')
    label = models.CharField(max_length=10, choices=LABEL_CHOICES, db_index=True) # Adicionado para performance
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at'] # Adicionado para ordenação padrão

    def __str__(self):
        """
        Retorna uma representação em string da foto, identificando o
        paciente e o rótulo da foto.
        """
        return f"Foto de {self.evaluation.patient.user.name} - {self.get_label_display()}"