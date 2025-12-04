from django.db import models
from patients.models import PatientProfile
from django.core.exceptions import ValidationError
import json

# Validadores de esquema JSON
def validate_meals_schema(value):
    """
    Valida o esquema JSON para o campo 'meals'.
    Espera uma lista de objetos de refeição.
    """
    if not isinstance(value, list):
        raise ValidationError("Meals deve ser uma lista.")
    for meal in value:
        if not isinstance(meal, dict):
            raise ValidationError("Cada refeição deve ser um objeto.")
        if not all(k in meal for k in ['nome', 'horario', 'alimentos']):
            raise ValidationError("Cada refeição deve ter 'nome', 'horario' e 'alimentos'.")
        if not isinstance(meal['alimentos'], list):
            raise ValidationError("Alimentos deve ser uma lista.")
        for food in meal['alimentos']:
            if not all(k in food for k in ['nome', 'quantidade', 'unidade']):
                raise ValidationError("Cada alimento deve ter 'nome', 'quantidade' e 'unidade'.")

def validate_substitutions_schema(value):
    """
    Valida o esquema JSON para o campo 'substitutions'.
    Espera uma lista de objetos de substituição.
    """
    if not isinstance(value, list):
        raise ValidationError("Substitutions deve ser uma lista.")
    for sub in value:
        if not isinstance(sub, dict):
            raise ValidationError("Cada substituição deve ser um objeto.")
        if not all(k in sub for k in ['original', 'options']):
            raise ValidationError("Cada substituição deve ter 'original' e 'options'.")
        if not isinstance(sub['options'], list):
            raise ValidationError("Options deve ser uma lista.")
        for option in sub['options']:
            if not all(k in option for k in ['name', 'quantity']):
                raise ValidationError("Cada opção deve ter 'name' e 'quantity'.")


class AlimentoTACO(models.Model):
    """Modelo para armazenar dados da Tabela TACO de Composição de Alimentos"""
    codigo = models.CharField(max_length=10, unique=True, help_text="Código do alimento na TACO")
    nome = models.CharField(max_length=200, help_text="Nome do alimento")
    
    # Composição nutricional por 100g
    energia_kcal = models.FloatField(help_text="Energia em kcal por 100g")
    proteina_g = models.FloatField(help_text="Proteína em gramas por 100g")
    lipidios_g = models.FloatField(help_text="Lipídios em gramas por 100g")
    carboidrato_g = models.FloatField(help_text="Carboidrato em gramas por 100g")
    fibra_g = models.FloatField(default=0, help_text="Fibra em gramas por 100g")
    
    # Minerais
    calcio_mg = models.FloatField(null=True, blank=True, help_text="Cálcio em mg por 100g")
    ferro_mg = models.FloatField(null=True, blank=True, help_text="Ferro em mg por 100g")
    sodio_mg = models.FloatField(null=True, blank=True, help_text="Sódio em mg por 100g")
    
    # Vitaminas
    vitamina_c_mg = models.FloatField(null=True, blank=True, help_text="Vitamina C em mg por 100g")
    
    # Categorização
    grupo = models.CharField(max_length=50, help_text="Grupo alimentar (ex: Cereais, Carnes, etc.)")
    
    # Unidades de medida mais comuns
    unidade_caseira = models.CharField(max_length=50, null=True, blank=True, help_text="Unidade caseira (ex: 1 xícara, 1 fatia)")
    peso_unidade_caseira_g = models.FloatField(null=True, blank=True, help_text="Peso em gramas da unidade caseira")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome']
        verbose_name = "Alimento TACO"
        verbose_name_plural = "Alimentos TACO"
        indexes = [
            models.Index(fields=['nome']),
            models.Index(fields=['grupo']),
        ]
    
    def __str__(self):
        return self.nome
    
    @property
    def calorias(self):
        """Alias para energia_kcal para compatibilidade"""
        return self.energia_kcal
    
    @property
    def carboidratos(self):
        """Alias para carboidrato_g para compatibilidade"""
        return self.carboidrato_g
    
    @property
    def proteinas(self):
        """Alias para proteina_g para compatibilidade"""
        return self.proteina_g
    
    @property
    def gorduras(self):
        """Alias para lipidios_g para compatibilidade"""
        return self.lipidios_g


class AlimentoTBCA(models.Model):
    """Tabela Brasileira de Composição de Alimentos - USP (v7.2 - 2022)"""
    codigo = models.CharField(max_length=20, unique=True, help_text="Código do alimento na TBCA")
    nome = models.CharField(max_length=255, help_text="Nome do alimento")
    
    # Composição nutricional por 100g
    energia_kcal = models.FloatField(help_text="Energia em kcal por 100g")
    proteina_g = models.FloatField(help_text="Proteína em gramas por 100g")
    lipidios_g = models.FloatField(help_text="Lipídios em gramas por 100g")
    carboidrato_g = models.FloatField(help_text="Carboidrato em gramas por 100g")
    fibra_g = models.FloatField(null=True, blank=True, help_text="Fibra em gramas por 100g")
    
    # Minerais
    sodio_mg = models.FloatField(null=True, blank=True, help_text="Sódio em mg por 100g")
    ferro_mg = models.FloatField(null=True, blank=True, help_text="Ferro em mg por 100g")
    calcio_mg = models.FloatField(null=True, blank=True, help_text="Cálcio em mg por 100g")
    
    # Vitaminas (TBCA tem dados mais completos que TACO)
    vitamina_c_mg = models.FloatField(null=True, blank=True, help_text="Vitamina C em mg por 100g")
    vitamina_a_mcg = models.FloatField(null=True, blank=True, help_text="Vitamina A em mcg por 100g")
    
    # Categorização
    grupo = models.CharField(max_length=100, help_text="Grupo alimentar")
    
    # Unidade caseira
    unidade_caseira = models.CharField(max_length=50, null=True, blank=True, help_text="Unidade caseira")
    peso_unidade_caseira_g = models.FloatField(null=True, blank=True, help_text="Peso em gramas da unidade caseira")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome']
        verbose_name = "Alimento TBCA"
        verbose_name_plural = "Alimentos TBCA"
        indexes = [
            models.Index(fields=['nome']),
            models.Index(fields=['grupo']),
        ]
    
    def __str__(self):
        return self.nome
    
    @property
    def calorias(self):
        return self.energia_kcal
    
    @property
    def carboidratos(self):
        return self.carboidrato_g
    
    @property
    def proteinas(self):
        return self.proteina_g
    
    @property
    def gorduras(self):
        return self.lipidios_g


class AlimentoUSDA(models.Model):
    """United States Department of Agriculture - FoodData Central"""
    fdc_id = models.IntegerField(unique=True, help_text="FDC ID do USDA")
    nome = models.CharField(max_length=255, help_text="Nome do alimento")
    
    # Composição nutricional por 100g
    energia_kcal = models.FloatField(help_text="Energia em kcal por 100g")
    proteina_g = models.FloatField(help_text="Proteína em gramas por 100g")
    lipidios_g = models.FloatField(help_text="Lipídios em gramas por 100g")
    carboidrato_g = models.FloatField(help_text="Carboidrato em gramas por 100g")
    fibra_g = models.FloatField(null=True, blank=True, help_text="Fibra em gramas por 100g")
    
    # Minerais
    sodio_mg = models.FloatField(null=True, blank=True, help_text="Sódio em mg por 100g")
    ferro_mg = models.FloatField(null=True, blank=True, help_text="Ferro em mg por 100g")
    calcio_mg = models.FloatField(null=True, blank=True, help_text="Cálcio em mg por 100g")
    
    # Vitaminas (USDA tem dados muito completos)
    vitamina_c_mg = models.FloatField(null=True, blank=True, help_text="Vitamina C em mg por 100g")
    vitamina_a_mcg = models.FloatField(null=True, blank=True, help_text="Vitamina A em mcg por 100g")
    vitamina_d_mcg = models.FloatField(null=True, blank=True, help_text="Vitamina D em mcg por 100g")
    
    # Categorização
    categoria = models.CharField(max_length=100, help_text="Categoria USDA")
    
    # Porção padrão
    porcao_padrao_g = models.FloatField(default=100, help_text="Porção padrão em gramas")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome']
        verbose_name = "Alimento USDA"
        verbose_name_plural = "Alimentos USDA"
        indexes = [
            models.Index(fields=['nome']),
            models.Index(fields=['categoria']),
        ]
    
    def __str__(self):
        return self.nome
    
    @property
    def calorias(self):
        return self.energia_kcal
    
    @property
    def carboidratos(self):
        return self.carboidrato_g
    
    @property
    def proteinas(self):
        return self.proteina_g
    
    @property
    def gorduras(self):
        return self.lipidios_g
    
    @property
    def grupo(self):
        """Alias para categoria para compatibilidade"""
        return self.categoria


class Diet(models.Model):
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name="diets",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255, db_index=True)
    
    # Novos campos para sistema avançado
    goal = models.TextField(blank=True, null=True, help_text="Objetivo da dieta")
    instructions = models.TextField(blank=True, null=True, help_text="Instruções e observações")
    
    # Cálculos nutricionais (novos campos)
    tmb = models.IntegerField(null=True, blank=True, help_text="Taxa Metabólica Basal")
    gcdt = models.IntegerField(null=True, blank=True, help_text="Gasto Calórico Diário Total")
    target_calories = models.IntegerField(null=True, blank=True, help_text="Meta de calorias")
    
    # Configurações de dieta
    diet_type = models.CharField(max_length=50, default='balanced', help_text="Tipo de dieta (balanced, lowcarb, etc)")
    calculation_method = models.CharField(max_length=50, default='mifflin', help_text="Método de cálculo (mifflin, harris, etc)")
    
    # Metas de macronutrientes (novos campos em decimal para precisão)
    target_protein = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Meta de proteínas em gramas")
    target_carbs = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Meta de carboidratos em gramas")
    target_fats = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Meta de gorduras em gramas")
    
    # Campos legados (manter para compatibilidade)
    meals = models.JSONField(null=True, blank=True, validators=[validate_meals_schema])
    substitutions = models.JSONField(null=True, blank=True, validators=[validate_substitutions_schema])
    notes = models.TextField(null=True, blank=True, verbose_name="Observações")
    meta_calorias = models.PositiveIntegerField(null=True, blank=True, help_text="Meta de calorias diárias (legado)")
    meta_carboidratos = models.PositiveIntegerField(null=True, blank=True, help_text="Meta de carboidratos em gramas (legado)")
    meta_proteinas = models.PositiveIntegerField(null=True, blank=True, help_text="Meta de proteínas em gramas (legado)")
    meta_gorduras = models.PositiveIntegerField(null=True, blank=True, help_text="Meta de gorduras em gramas (legado)")
    tmb_calculado = models.PositiveIntegerField(null=True, blank=True, help_text="Taxa Metabólica Basal calculada (legado)")
    gcdt_calculado = models.PositiveIntegerField(null=True, blank=True, help_text="Gasto Calórico Diário Total calculado (legado)")
    formula_tmb = models.CharField(
        max_length=20, 
        choices=[
            ('harris-benedict', 'Harris-Benedict'),
            ('mifflin-st-jeor', 'Mifflin-St Jeor'),
            ('katch-mcardle', 'Katch-McArdle'),
        ],
        null=True, 
        blank=True
    )
    nivel_atividade = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text="Fator de atividade física")
    objetivo = models.CharField(
        max_length=10,
        choices=[
            ('manter', 'Manter peso'),
            ('perder', 'Perder peso'),
            ('ganhar', 'Ganhar peso'),
        ],
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, help_text="Se o plano está ativo", db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Plano Alimentar"
        verbose_name_plural = "Planos Alimentares"

    def __str__(self):
        return f"{self.name} - {self.patient.user.name}"
    
    @property
    def total_refeicoes(self):
        """Retorna o número total de refeições configuradas"""
        return len(self.meals) if self.meals else 0
    
    @property
    def tem_substituicoes(self):
        """Verifica se há substituições configuradas"""
        return bool(self.substitutions and len(self.substitutions) > 0)


class Meal(models.Model):
    """Modelo para refeições individuais dentro de uma dieta."""
    diet = models.ForeignKey(Diet, on_delete=models.CASCADE, related_name='refeicoes')
    name = models.CharField(max_length=100, help_text="Nome da refeição (Café, Almoço, etc)")
    time = models.TimeField(help_text="Horário da refeição")
    day_of_week = models.IntegerField(
        default=0,
        help_text="Dia da semana (0=SEG, 1=TER, 2=QUA, 3=QUI, 4=SEX, 5=SAB, 6=DOM)"
    )
    order = models.IntegerField(default=0, help_text="Ordem de exibição")
    notes = models.TextField(blank=True, null=True, help_text="Orientações da refeição")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['day_of_week', 'order', 'time']
        verbose_name = "Refeição"
        verbose_name_plural = "Refeições"
    
    def __str__(self):
        dias_semana = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM']
        dia = dias_semana[self.day_of_week] if 0 <= self.day_of_week <= 6 else 'N/A'
        return f"{self.name} - {dia} {self.time.strftime('%H:%M')}"
    
    @property
    def total_calorias(self):
        """Calcula o total de calorias da refeição"""
        return sum(item.calories for item in self.items.all())
    
    @property
    def total_proteinas(self):
        """Calcula o total de proteínas da refeição"""
        return sum(item.protein for item in self.items.all())
    
    @property
    def total_carboidratos(self):
        """Calcula o total de carboidratos da refeição"""
        return sum(item.carbs for item in self.items.all())
    
    @property
    def total_gorduras(self):
        """Calcula o total de gorduras da refeição"""
        return sum(item.fats for item in self.items.all())


class FoodItem(models.Model):
    """Modelo para itens de alimento dentro de uma refeição."""
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='items')
    food_name = models.CharField(max_length=255, help_text="Nome do alimento")
    quantity = models.DecimalField(max_digits=8, decimal_places=2, help_text="Quantidade em unidade")
    unit = models.CharField(max_length=20, default='g', help_text="Unidade de medida (g, ml, und)")
    
    # Valores nutricionais calculados (por porção)
    calories = models.DecimalField(max_digits=8, decimal_places=2, help_text="Calorias calculadas")
    protein = models.DecimalField(max_digits=8, decimal_places=2, help_text="Proteínas em g")
    carbs = models.DecimalField(max_digits=8, decimal_places=2, help_text="Carboidratos em g")
    fats = models.DecimalField(max_digits=8, decimal_places=2, help_text="Gorduras em g")
    fiber = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Fibras em g")
    
    # Referências opcionais às bases de dados
    taco_food = models.ForeignKey(AlimentoTACO, on_delete=models.SET_NULL, null=True, blank=True, related_name='diet_items')
    tbca_food = models.ForeignKey(AlimentoTBCA, on_delete=models.SET_NULL, null=True, blank=True, related_name='diet_items')
    usda_food = models.ForeignKey(AlimentoUSDA, on_delete=models.SET_NULL, null=True, blank=True, related_name='diet_items')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Item Alimentar"
        verbose_name_plural = "Itens Alimentares"
        ordering = ['meal', 'id']
    
    def __str__(self):
        return f"{self.food_name} - {self.quantity}{self.unit}"

