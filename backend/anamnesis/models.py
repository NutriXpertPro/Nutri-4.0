from django.db import models
from django.conf import settings
from patients.models import PatientProfile
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator


class Anamnesis(models.Model):
    """
    Questionário completo de anamnese do paciente com 7 seções:
    1. Identificação, 2. Rotina, 3. Nutrição e Hábitos, 4. Histórico de Saúde,
    5. Objetivos, 6. Medidas, 7. Fotos
    """
    
    # Campo One-to-One: Cada paciente tem uma única anamnese
    patient = models.OneToOneField(
        PatientProfile, on_delete=models.CASCADE, primary_key=True
    )
    
    # ========== 1. IDENTIFICAÇÃO ==========
    nome = models.CharField(max_length=200, blank=True)
    idade = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(150)])
    sexo = models.CharField(
        max_length=20,
        choices=[
            ('Feminino', 'Feminino'),
            ('Masculino', 'Masculino'),
            ('Outro', 'Outro')
        ],
        blank=True
    )
    nascimento = models.DateField(null=True, blank=True)
    profissao = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    
    # ========== 2. ROTINA ==========
    hora_acorda = models.TimeField(null=True, blank=True)
    hora_dorme = models.TimeField(null=True, blank=True)
    dificuldade_dormir = models.TextField(blank=True)
    horario_treino = models.CharField(max_length=100, blank=True)
    tempo_disponivel_treino = models.CharField(max_length=100, blank=True)
    dias_treino_semana = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(2), MaxValueValidator(7)]
    )
    
    # ========== 3. NUTRIÇÃO E HÁBITOS ==========
    peso = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    altura = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    peso_status = models.CharField(
        max_length=20,
        choices=[
            ('Aumentando', 'Aumentando'),
            ('Diminuindo', 'Diminuindo'),
            ('Estável', 'Estável')
        ],
        blank=True
    )
    alimentos_restritos = models.TextField(blank=True)
    ja_fez_dieta = models.BooleanField(default=False)
    resultado_dieta = models.TextField(blank=True)  # Condicional: mostra se ja_fez_dieta=True
    intestino = models.CharField(
        max_length=20,
        choices=[('Preso', 'Preso'), ('Regular', 'Regular')],
        blank=True
    )
    dias_sem_banheiro = models.IntegerField(null=True, blank=True)
    vezes_banheiro_dia = models.IntegerField(null=True, blank=True)
    litros_agua_dia = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True
    )
    vontade_doce = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    horarios_maior_apetite = models.TextField(blank=True)
    preferencia_lanches = models.CharField(
        max_length=50,
        choices=[
            ('Doce', 'Doce'),
            ('Salgado', 'Salgado'),
            ('Doce e Salgado', 'Doce e Salgado')
        ],
        blank=True
    )
    frutas_preferencia = models.TextField(blank=True)
    
    # ========== 4. HISTÓRICO DE SAÚDE ==========
    doenca_familiar = models.TextField(blank=True, help_text="Histórico de doenças na família")
    problema_saude = models.BooleanField(default=False)
    problemas_saude_detalhes = models.TextField(blank=True)  # Condicional: mostra se problema_saude=True
    problema_articular = models.TextField(blank=True)
    uso_medicamentos = models.BooleanField(default=False)
    medicamentos_detalhes = models.TextField(blank=True)  # Condicional: mostra se uso_medicamentos=True
    uso_cigarros = models.BooleanField(default=False)
    intolerancia = models.BooleanField(default=False)
    intolerancia_detalhes = models.TextField(blank=True)  # Condicional: mostra se intolerancia=True
    uso_anticoncepcional = models.BooleanField(default=False)  # Condicional: mostra se sexo=Feminino
    termogenico_usado = models.TextField(blank=True)
    uso_alcool = models.BooleanField(default=False)
    alcool_frequencia = models.CharField(max_length=100, blank=True)  # Condicional: mostra se uso_alcool=True
    ja_usou_anabolizante = models.BooleanField(default=False)
    anabolizante_problemas = models.TextField(blank=True)  # Condicional: mostra se ja_usou_anabolizante=True
    pretende_usar_anabolizante = models.BooleanField(default=False)
    
    # ========== 5. OBJETIVOS ==========
    objetivo = models.CharField(
        max_length=100,
        choices=[
            ('Emagrecimento', 'Emagrecimento'),
            ('Ganho de massa muscular', 'Ganho de massa muscular'),
            ('Ganho de peso', 'Ganho de peso'),
            ('Trincar o shape', 'Trincar o shape')
        ],
        blank=True
    )
    compromisso_relatorios = models.BooleanField(
        default=False,
        help_text="Se compromete a enviar fotos e relatórios semanalmente?"
    )
    
    # ========== 6. MEDIDAS (cm) ==========
    pescoco = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    cintura = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    quadril = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Condicional: mostra se sexo=Feminino
    
    # ========== 7. FOTOS ==========
    foto_frente = models.ImageField(
        upload_to='anamnesis_photos/',
        null=True,
        blank=True,
        help_text="Foto de frente (👙/🩲)"
    )
    foto_lado = models.ImageField(
        upload_to='anamnesis_photos/',
        null=True,
        blank=True,
        help_text="Foto de lado (👙/🩲)"
    )
    foto_costas = models.ImageField(
        upload_to='anamnesis_photos/',
        null=True,
        blank=True,
        help_text="Foto de costas (👙/🩲)"
    )
    
    # ========== METADADOS ==========
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Anamnese'
        verbose_name_plural = 'Anamneses'

    def __str__(self):
        """Retorna uma representação em string da anamnese."""
        return f"Anamnese de {self.patient.user.name}"
    

    def get_progresso(self):
        """Calcula o progresso de preenchimento do questionário (0-100%)."""
        campos_obrigatorios = [
            self.nome, self.idade, self.sexo, self.nascimento, self.email,
            self.telefone, self.peso, self.altura, self.objetivo
        ]
        preenchidos = sum(1 for campo in campos_obrigatorios if campo)
        return int((preenchidos / len(campos_obrigatorios)) * 100)


class AnamnesisTemplate(models.Model):
    """
    Modelos de anamnese personalizados criados pelo nutricionista.
    Estrutura de perguntas é salva em JSON.
    """
    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="anamnesis_templates"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    questions = models.JSONField(default=list)  # Lista de objetos {id, type, label, options, required}
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Modelo de Anamnese'
        verbose_name_plural = 'Modelos de Anamnese'

    def __str__(self):
        return self.title


class AnamnesisResponse(models.Model):
    """
    Respostas de uma anamnese personalizada.
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="anamnesis_responses"
    )
    template = models.ForeignKey(
        AnamnesisTemplate,
        on_delete=models.CASCADE,
        related_name="responses"
    )
    answers = models.JSONField(default=dict)  # Dicionário {question_id: answer_value}
    filled_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-filled_date']
        verbose_name = 'Resposta de Anamnese'
        verbose_name_plural = 'Respostas de Anamnese'

    def __str__(self):
        return f"{self.template.title} - {self.patient.user.name}"
