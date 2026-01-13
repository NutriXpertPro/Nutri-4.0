from django.db import models
from django.conf import settings
from datetime import date
from django.utils.translation import gettext_lazy as _
from utils.sanitization import sanitize_string

# Create your models here.


class PatientProfile(models.Model):
    """
    Representa o perfil de um paciente, contendo informações pessoais e
    metadados associados ao tratamento nutricional.
    """
    SERVICE_TYPE_CHOICES = [
        ('ONLINE', _('Online')),
        ('PRESENCIAL', _('Presencial')),
    ]
    GOAL_CHOICES = [
        ('PERDA_PESO', _('Perda de peso - Redução de peso com foco em saúde e sustentabilidade')),
        ('GANHO_MUSCULAR', _('Ganho de massa muscular - Hipertrofia e desenvolvimento muscular')),
        ('MANUTENCAO_PESO', _('Manutenção do peso - Equilíbrio e manutenção do peso atual')),
        ('PERFORMANCE_ESPORTIVA', _('Performance esportiva - Otimização do desempenho atlético e competitivo')),
        ('GESTACAO_LACTACAO', _('Gestação e lactação - Acompanhamento nutricional materno-infantil')),
        ('DOENCAS_CRONICAS', _('Manejo de doenças crônicas - Diabetes, hipertensão, dislipidemias, doenças cardiovasculares')),
        ('REABILITACAO_NUTRICIONAL', _('Reabilitação nutricional - Recuperação pós-cirúrgica ou pós-doença')),
        ('TRANSTORNOS_ALIMENTARES', _('Transtornos alimentares - Apoio no tratamento de anorexia, bulimia, compulsão alimentar')),
        ('ALERGIAS_INTOLERANCIAS', _('Alergias e intolerâncias alimentares - Manejo de restrições alimentares específicas')),
        ('DISTURBIOS_GASTROINTESTINAIS', _('Distúrbios gastrointestinais - Síndrome do intestino irritável, doença celíaca, refluxo')),
        ('CONDICOES_HORMONAIS', _('Condições hormonais - SOP (Síndrome dos Ovários Policísticos), hipotireoidismo, menopausa')),
        ('NUTRICAO_FUNCIONAL', _('Nutrição funcional e integrativa - Abordagem holística e preventiva')),
        ('SUPLEMENTACAO_ORIENTADA', _('Suplementação orientada - Otimização do uso de suplementos nutricionais')),
        ('SAUDE_IDOSO', _('Saúde do idoso - Nutrição voltada para longevidade e qualidade de vida')),
        ('PREVENCAO_DOENCAS', _('Prevenção de doenças - Promoção de saúde e hábitos preventivos')),
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
    target_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Peso alvo do paciente em kg")
    )
    target_body_fat = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Percentual de gordura corporal alvo")
    )
    service_type = models.CharField(
        max_length=20,
        choices=SERVICE_TYPE_CHOICES,
        null=True,
        blank=True,
        db_index=True # Added for performance
    )
    start_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)


    @property
    def active_evaluation(self):
        """Retorna a avaliação mais recente do paciente para pegar peso/altura atuais."""
        return self.evaluations.first()

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

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.address:
            self.address = sanitize_string(self.address)
        super().save(*args, **kwargs)

    def __str__(self):
        """
        Retorna o nome do usuário associado ao perfil do paciente.
        """
        if self.user:
            return self.user.name
        return f"PatientProfile {self.pk}"


# Importar modelos de diário, social e adesão (após PatientProfile para evitar problemas de referência circular)
from .models_diary import PatientDiaryEntry, SocialLike, SocialComment
from .models_adherence import AdherenceRecord
from .models_patient_data import (
    PatientMetric,
    MealCheckIn,
    ProgressPhoto,
    BodyMeasurement,
    AppointmentConfirmation,
    ClinicalNote
)