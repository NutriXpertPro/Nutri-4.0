from django.db import models
from patients.models import PatientProfile
from django.core.exceptions import ValidationError
import json
from django.conf import settings
from utils.sanitization import sanitize_string

# Modelo para Favoritos
class FavoriteFood(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_foods')
    food_source = models.CharField(max_length=50)  # TACO, TBCA, USDA, IBGE
    food_id = models.CharField(max_length=100)     # ID original na tabela de origem
    food_name = models.CharField(max_length=255)   # Nome para busca rápida (cache)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'food_source', 'food_id']
        indexes = [
            models.Index(fields=['user', 'food_name']),
        ]

    def __str__(self):
        return f"{self.food_name} ({self.food_source})"
# Validadores de esquema JSON
def validate_meals_schema(value):
    """
    Valida o esquema JSON para o campo 'meals'.
    Espera uma lista de objetos de refeição.
    """
    if not isinstance(value, list):
        raise ValidationError("Meals deve ser uma lista.")

    for i, meal in enumerate(value):
        if not isinstance(meal, dict):
            raise ValidationError(f"A refeição na posição {i} deve ser um objeto.")

        # Sanitizar os campos de string antes da validação
        if 'nome' in meal:
            meal['nome'] = sanitize_string(meal['nome'])
        if 'horario' in meal:
            meal['horario'] = sanitize_string(meal['horario'])

        if not all(k in meal for k in ['nome', 'horario', 'alimentos']):
            raise ValidationError(f"A refeição na posição {i} deve ter 'nome', 'horario' e 'alimentos'.")

        if not isinstance(meal['alimentos'], list):
            raise ValidationError(f"Os alimentos da refeição na posição {i} devem ser uma lista.")

        for j, food in enumerate(meal['alimentos']):
            if not isinstance(food, dict):
                raise ValidationError(f"O alimento na posição {j} da refeição na posição {i} deve ser um objeto.")

            # Sanitizar os campos de string
            if 'nome' in food:
                food['nome'] = sanitize_string(food['nome'])
            if 'unidade' in food:
                food['unidade'] = sanitize_string(food['unidade'])

            if not all(k in food for k in ['nome', 'quantidade', 'unidade']):
                raise ValidationError(f"O alimento na posição {j} da refeição na posição {i} deve ter 'nome', 'quantidade' e 'unidade'.")

def validate_substitutions_schema(value):
    """
    Valida o esquema JSON para o campo 'substitutions'.
    Espera uma lista de objetos de substituição.
    """
    if not isinstance(value, list):
        raise ValidationError("Substitutions deve ser uma lista.")

    for i, sub in enumerate(value):
        if not isinstance(sub, dict):
            raise ValidationError(f"A substituição na posição {i} deve ser um objeto.")

        # Sanitizar os campos de string
        if 'original' in sub:
            sub['original'] = sanitize_string(sub['original'])

        if not all(k in sub for k in ['original', 'options']):
            raise ValidationError(f"A substituição na posição {i} deve ter 'original' e 'options'.")

        if not isinstance(sub['options'], list):
            raise ValidationError(f"As opções da substituição na posição {i} devem ser uma lista.")

        for j, option in enumerate(sub['options']):
            if not isinstance(option, dict):
                raise ValidationError(f"A opção na posição {j} da substituição na posição {i} deve ser um objeto.")

            # Sanitizar os campos de string
            if 'name' in option:
                option['name'] = sanitize_string(option['name'])

            if not all(k in option for k in ['name', 'quantity']):
                raise ValidationError(f"A opção na posição {j} da substituição na posição {i} deve ter 'name' e 'quantity'.")


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
    
    # Arquivo PDF gerado
    pdf_file = models.FileField(upload_to='diet_pdfs/%Y/%m/', null=True, blank=True, help_text="Arquivo PDF da dieta gerado")

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

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.name:
            self.name = sanitize_string(self.name)
        if self.goal:
            self.goal = sanitize_string(self.goal)
        if self.instructions:
            self.instructions = sanitize_string(self.instructions)
        if self.notes:
            self.notes = sanitize_string(self.notes)
        super().save(*args, **kwargs)


class Meal(models.Model):
    """Modelo para refeições individuais dentro de uma dieta."""
    diet = models.ForeignKey(Diet, on_delete=models.CASCADE, related_name='meals_rel')  # Usando nome que não conflita
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

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.name:
            self.name = sanitize_string(self.name)
        if self.notes:
            self.notes = sanitize_string(self.notes)
        super().save(*args, **kwargs)

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
    taco_food = models.ForeignKey(AlimentoTACO, on_delete=models.SET_NULL, null=True, blank=True, related_name='food_items')
    tbca_food = models.ForeignKey(AlimentoTBCA, on_delete=models.SET_NULL, null=True, blank=True, related_name='food_items')
    usda_food = models.ForeignKey(AlimentoUSDA, on_delete=models.SET_NULL, null=True, blank=True, related_name='food_items')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Item Alimentar"
        verbose_name_plural = "Itens Alimentares"
        ordering = ['meal', 'id']

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.food_name:
            self.food_name = sanitize_string(self.food_name)
        if self.unit:
            self.unit = sanitize_string(self.unit)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.food_name} - {self.quantity}{self.unit}"


# =============================================================================
# MODELOS DE MEDIDAS CASEIRAS IBGE
# Dados extraídos da Pesquisa de Orçamentos Familiares 2008-2009
# 9.832 registros | 1.053 alimentos | 102 tipos de medidas
# =============================================================================

class MedidaCaseira(models.Model):
    """
    Modelo para armazenar tipos de medidas caseiras com pesos médios.
    Fonte: IBGE POF 2008-2009
    """
    CATEGORIA_CHOICES = [
        ('utensiilio', 'Utensílio de cozinha'),
        ('porcao', 'Porção/Quantidade'),
        ('unidade', 'Unidade natural'),
        ('embalagem', 'Embalagem'),
        ('liquido', 'Medida de líquido'),
        ('outro', 'Outro'),
    ]
    
    nome = models.CharField(max_length=100, unique=True, help_text="Nome da medida caseira (ex: Colher de sopa)")
    peso_medio_g = models.FloatField(null=True, blank=True, help_text="Peso médio em gramas")
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES, default='outro')
    quantidade_amostras = models.IntegerField(default=0, help_text="Número de amostras usadas para calcular a média")
    
    # Para líquidos
    eh_liquido = models.BooleanField(default=False, help_text="Se a medida é tipicamente para líquidos")
    volume_ml = models.FloatField(null=True, blank=True, help_text="Volume em ml (para líquidos)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome']
        verbose_name = "Medida Caseira"
        verbose_name_plural = "Medidas Caseiras"
        indexes = [
            models.Index(fields=['nome']),
            models.Index(fields=['categoria']),
        ]
    
    def __str__(self):
        if self.peso_medio_g:
            return f"{self.nome} (~{self.peso_medio_g}g)"
        return self.nome


class AlimentoMedidaIBGE(models.Model):
    """
    Modelo para armazenar conversões específicas de medidas por alimento.
    Vincula um alimento a uma medida caseira com peso específico.
    Fonte: IBGE POF 2008-2009
    """
    PREPARACAO_CHOICES = [
        ('cru', 'Cru(a)'),
        ('cozido', 'Cozido(a)'),
        ('frito', 'Frito(a)'),
        ('assado', 'Assado(a)'),
        ('grelhado', 'Grelhado(a)/brasa/churrasco'),
        ('refogado', 'Refogado(a)'),
        ('empanado', 'Empanado(a)/à milanesa'),
        ('molho_vermelho', 'Molho vermelho'),
        ('molho_branco', 'Molho branco'),
        ('ensopado', 'Ensopado'),
        ('sopa', 'Sopa'),
        ('vinagrete', 'Ao vinagrete'),
        ('manteiga', 'Com manteiga/óleo'),
        ('alho_oleo', 'Ao alho e óleo'),
        ('mingau', 'Mingau'),
        ('nao_aplica', 'Não se aplica'),
    ]
    
    codigo_ibge = models.CharField(max_length=10, help_text="Código do alimento no IBGE")
    nome_alimento = models.CharField(max_length=200, help_text="Nome do alimento")
    
    medida = models.ForeignKey(MedidaCaseira, on_delete=models.CASCADE, related_name='alimentos')
    preparacao = models.CharField(max_length=20, choices=PREPARACAO_CHOICES, default='nao_aplica')
    peso_g = models.FloatField(help_text="Peso em gramas para esta medida específica")
    
    # Referência opcional para alimentos nas bases TACO/TBCA/USDA
    taco_ref = models.ForeignKey(AlimentoTACO, on_delete=models.SET_NULL, null=True, blank=True, related_name='medidas_ibge')
    tbca_ref = models.ForeignKey(AlimentoTBCA, on_delete=models.SET_NULL, null=True, blank=True, related_name='medidas_ibge')
    usda_ref = models.ForeignKey(AlimentoUSDA, on_delete=models.SET_NULL, null=True, blank=True, related_name='medidas_ibge')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['nome_alimento', 'medida__nome']
        verbose_name = "Medida de Alimento IBGE"
        verbose_name_plural = "Medidas de Alimentos IBGE"
        indexes = [
            models.Index(fields=['nome_alimento']),
            models.Index(fields=['codigo_ibge']),
            models.Index(fields=['preparacao']),
        ]
        # Um alimento pode ter várias medidas, mas cada combinação alimento+medida+preparação é única
        unique_together = ['codigo_ibge', 'medida', 'preparacao']
    
    def __str__(self):
        return f"{self.nome_alimento} - {self.medida.nome} ({self.preparacao}): {self.peso_g}g"
    
    @property
    def descricao_completa(self):
        """Retorna descrição para exibição ao usuário"""
        return f"1 {self.medida.nome} = {self.peso_g}g"


class DietViewLog(models.Model):
    """
    Registra cada vez que um paciente visualiza seu plano alimentar.
    Usado como um proxy para medir o engajamento e a adesão.
    """
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='diet_view_logs')
    diet = models.ForeignKey(Diet, on_delete=models.CASCADE, related_name='view_logs')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-viewed_at']
        verbose_name = "Log de Visualização de Dieta"
        verbose_name_plural = "Logs de Visualização de Dieta"
        indexes = [
            models.Index(fields=['patient', 'viewed_at']),
            models.Index(fields=['diet']),
        ]

    def __str__(self):
        return f"{self.patient.user.name} visualizou {self.diet.name} em {self.viewed_at.strftime('%Y-%m-%d %H:%M')}"


class MealPreset(models.Model):
    """
    Modelo para armazenar pr-sets de refeies personalizados por nutricionista
    """
    MEAL_TYPE_CHOICES = [
        ('cafe_da_manha', 'Café da Manhã'),
        ('almoco', 'Almoço'),
        ('jantar', 'Jantar'),
        ('lanche_manha', 'Lanche da Manhã'),
        ('lanche_tarde', 'Lanche da Tarde'),
        ('ceia', 'Ceia'),
        ('pre_treino', 'Pré-treino'),
        ('pos_treino', 'Pós-treino'),
        ('suplemento', 'Suplemento'),
        ('outros', 'Outros'),
    ]

    DIET_TYPE_CHOICES = [
        ('normocalorica', 'Normocalórica'),
        ('balanced', 'Balanceado'),
        ('low_carb', 'Low Carb'),
        ('lowcarb', 'Low Carb (Legado)'),
        ('high_carb', 'High Carb'),
        ('highcarb', 'High Carb (Legado)'),
        ('cetogenica', 'Cetogênica'),
        ('ketogenic', 'Cetogênico (Legado)'),
        ('mediterranea', 'Mediterrânea'),
        ('vegetariana', 'Vegetariana'),
        ('vegana', 'Vegana'),
        ('sem_gluten', 'Sem Glúten'),
        ('hiperproteica', 'Hiperproteica'),
        ('hypertrophy', 'Hipertrofia (Legado)'),
        ('weight_loss', 'Perda de Peso'),
        ('weight_gain', 'Ganho de Peso'),
        ('custom', 'Personalizado'),
        ('personalizada', 'Personalizado (Frontend)'),
    ]

    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='meal_presets',
        help_text="Nutricionista proprietário do preset"
    )
    name = models.CharField(max_length=255, help_text="Nome do preset")
    meal_type = models.CharField(
        max_length=20,
        choices=MEAL_TYPE_CHOICES,
        help_text="Tipo de refeição para este preset"
    )
    diet_type = models.CharField(
        max_length=20,
        choices=DIET_TYPE_CHOICES,
        default='balanced',
        help_text="Tipo de dieta para este preset"
    )
    description = models.TextField(blank=True, null=True, help_text="Descrição opcional do preset")

    # Estrutura JSON para armazenar os alimentos do preset
    foods = models.JSONField(
        help_text="Lista de alimentos no preset",
        default=list
    )

    # Calorias totais calculadas para facilitar busca e filtragem
    total_calories = models.IntegerField(default=0, help_text="Calorias totais calculadas")
    total_protein = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Proteínas totais em g")
    total_carbs = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Carboidratos totais em g")
    total_fats = models.DecimalField(max_digits=8, decimal_places=2, default=0, help_text="Gorduras totais em g")

    is_active = models.BooleanField(default=True, help_text="Se o preset está ativo")
    is_public = models.BooleanField(default=False, help_text="Se o preset pode ser compartilhado com outros")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['meal_type', 'diet_type', 'name']
        verbose_name = "Preset de Refeição"
        verbose_name_plural = "Presets de Refeições"
        indexes = [
            models.Index(fields=['nutritionist', 'meal_type']),
            models.Index(fields=['nutritionist', 'diet_type']),
            models.Index(fields=['meal_type', 'diet_type']),
            models.Index(fields=['is_active']),
        ]
        unique_together = ['nutritionist', 'name', 'meal_type', 'diet_type']

    def __str__(self):
        return f"{self.name} ({self.get_meal_type_display()} - {self.get_diet_type_display()})"

    def save(self, *args, **kwargs):
        """Sanitizar campos de texto antes de salvar"""
        if self.name:
            self.name = sanitize_string(self.name)
        if self.description:
            self.description = sanitize_string(self.description)
        super().save(*args, **kwargs)


class DefaultPreset(models.Model):
    """
    Modelo para armazenar presets padro por tipo de refeio e tipo de dieta
    """
    MEAL_TYPE_CHOICES = [
        ('cafe_da_manha', 'Café da Manhã'),
        ('almoco', 'Almoço'),
        ('jantar', 'Jantar'),
        ('lanche_manha', 'Lanche da Manhã'),
        ('lanche_tarde', 'Lanche da Tarde'),
        ('ceia', 'Ceia'),
        ('pre_treino', 'Pré-treino'),
        ('pos_treino', 'Pós-treino'),
        ('suplemento', 'Suplemento'),
        ('outros', 'Outros'),
    ]

    DIET_TYPE_CHOICES = [
        ('normocalorica', 'Normocalórica'),
        ('balanced', 'Balanceado'),
        ('low_carb', 'Low Carb'),
        ('lowcarb', 'Low Carb (Legado)'),
        ('high_carb', 'High Carb'),
        ('highcarb', 'High Carb (Legado)'),
        ('cetogenica', 'Cetogênica'),
        ('ketogenic', 'Cetogênico (Legado)'),
        ('mediterranea', 'Mediterrânea'),
        ('vegetariana', 'Vegetariana'),
        ('vegana', 'Vegana'),
        ('sem_gluten', 'Sem Glúten'),
        ('hiperproteica', 'Hiperproteica'),
        ('hypertrophy', 'Hipertrofia (Legado)'),
        ('weight_loss', 'Perda de Peso'),
        ('weight_gain', 'Ganho de Peso'),
        ('custom', 'Personalizado'),
        ('personalizada', 'Personalizado (Frontend)'),
    ]

    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='default_presets',
        help_text="Nutricionista proprietário do preset padrão"
    )
    meal_type = models.CharField(
        max_length=20,
        choices=MEAL_TYPE_CHOICES,
        help_text="Tipo de refeição para este preset padrão"
    )
    diet_type = models.CharField(
        max_length=20,
        choices=DIET_TYPE_CHOICES,
        help_text="Tipo de dieta para este preset padrão"
    )
    preset = models.ForeignKey(
        'MealPreset',
        on_delete=models.CASCADE,
        help_text="Preset selecionado como padrão"
    )
    is_active = models.BooleanField(default=True, help_text="Se o preset padrão está ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['nutritionist', 'meal_type', 'diet_type']
        ordering = ['nutritionist', 'meal_type', 'diet_type']
        verbose_name = "Preset Padrão"
        verbose_name_plural = "Presets Padrão"

    def __str__(self):
        return f"{self.get_meal_type_display()} - {self.get_diet_type_display()} (Padrão)"

    def save(self, *args, **kwargs):
        """Validar que o preset pertence ao mesmo nutricionista"""
        if self.preset.nutritionist != self.nutritionist:
            raise ValidationError("O preset deve pertencer ao mesmo nutricionista.")
        super().save(*args, **kwargs)