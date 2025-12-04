from django.db import models
from django.conf import settings
from datetime import date

# Create your models here.


class PatientProfile(models.Model):
    """
    Representa o perfil de um paciente, contendo informações pessoais e
    metadados associados ao tratamento nutricional.
    """
    SERVICE_TYPE_CHOICES = [
        ('ONLINE', 'Online'),
        ('PRESENCIAL', 'Presencial'),
    ]
    GOAL_CHOICES = [
        ('PERDA_GORDURA', 'Perda de Gordura'),
        ('GANHO_MASSA', 'Ganho de Massa Muscular'),
        ('QUALIDADE_VIDA', 'Qualidade de Vida e Saúde'),
        ('OUTRO', 'Outro'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_profile",
        db_column="user_id",
    )

    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="managed_patients",
        limit_choices_to={"user_type": "nutricionista"},
    )

    birth_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # New fields
    goal = models.CharField(
        max_length=50,
        choices=GOAL_CHOICES,
        null=True,
        blank=True,
        db_index=True # Added for performance
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPE_CHOICES,
        null=True,
        blank=True,
        db_index=True # Added for performance
    )
    start_date = models.DateField(null=True, blank=True)


    class Meta:
        db_table = "patient_profiles"
        ordering = ['-created_at'] # Adicionado para ordenação padrão

    def get_age(self):
        """
        Calcula a idade do paciente com base na data de nascimento.
        """
        if self.birth_date:
            today = date.today()
            return (
                today.year
                - self.birth_date.year
                - (
                    (today.month, today.day)
                    < (self.birth_date.month, self.birth_date.day)
                )
            )
        return None

    def __str__(self):
        """
        Retorna o nome do usuário associado ao perfil do paciente.
        """
        if self.user:
            return self.user.name
        return f"PatientProfile {self.pk}"