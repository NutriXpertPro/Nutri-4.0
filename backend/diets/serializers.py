from rest_framework import serializers
from .models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA, Diet, Meal, FoodItem, MealPreset, DefaultPreset


class AlimentoTACOSerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()
    
    class Meta:
        model = AlimentoTACO
        fields = [
            'id', 'codigo', 'nome', 'grupo', 'source',
            'energia_kcal', 'proteina_g', 'lipidios_g', 'carboidrato_g', 'fibra_g',
            'calcio_mg', 'ferro_mg', 'sodio_mg', 'vitamina_c_mg',
            'unidade_caseira', 'peso_unidade_caseira_g'
        ]
    
    def get_source(self, obj):
        return 'TACO'


class AlimentoTBCASerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()
    
    class Meta:
        model = AlimentoTBCA
        fields = [
            'id', 'codigo', 'nome', 'grupo', 'source',
            'energia_kcal', 'proteina_g', 'lipidios_g', 'carboidrato_g', 'fibra_g',
            'calcio_mg', 'ferro_mg', 'sodio_mg', 'vitamina_c_mg', 'vitamina_a_mcg',
            'unidade_caseira', 'peso_unidade_caseira_g'
        ]
    
    def get_source(self, obj):
        return 'TBCA'


class AlimentoUSDASerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()
    grupo = serializers.CharField(source='categoria', read_only=True)
    
    class Meta:
        model = AlimentoUSDA
        fields = [
            'id', 'fdc_id', 'nome', 'grupo', 'categoria', 'source',
            'energia_kcal', 'proteina_g', 'lipidios_g', 'carboidrato_g', 'fibra_g',
            'calcio_mg', 'ferro_mg', 'sodio_mg', 'vitamina_c_mg', 'vitamina_a_mcg', 'vitamina_d_mcg',
            'porcao_padrao_g'
        ]
    
    def get_source(self, obj):
        return 'USDA'


# Unified Food Serializer for search results
class UnifiedFoodSerializer(serializers.Serializer):
    """Serializer unificado para resultados de busca de alimentos."""
    id = serializers.IntegerField()
    nome = serializers.CharField()
    grupo = serializers.CharField()
    source = serializers.CharField()
    energia_kcal = serializers.FloatField()
    proteina_g = serializers.FloatField()
    lipidios_g = serializers.FloatField()
    carboidrato_g = serializers.FloatField()
    fibra_g = serializers.FloatField(allow_null=True)
    unidade_caseira = serializers.CharField(allow_null=True, required=False)
    peso_unidade_caseira_g = serializers.FloatField(allow_null=True, required=False)


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            'id', 'food_name', 'quantity', 'unit',
            'calories', 'protein', 'carbs', 'fats', 'fiber',
            'taco_food', 'tbca_food', 'usda_food'
        ]


class MealSerializer(serializers.ModelSerializer):
    items = FoodItemSerializer(many=True, read_only=True)
    total_calorias = serializers.ReadOnlyField()
    total_proteinas = serializers.ReadOnlyField()
    total_carboidratos = serializers.ReadOnlyField()
    total_gorduras = serializers.ReadOnlyField()
    
    class Meta:
        model = Meal
        fields = [
            'id', 'name', 'time', 'day_of_week', 'order', 'notes',
            'items', 'total_calorias', 'total_proteinas', 'total_carboidratos', 'total_gorduras'
        ]


class MealPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPreset
        fields = [
            'id', 'name', 'meal_type', 'diet_type', 'description',
            'foods', 'total_calories', 'total_protein', 'total_carbs', 'total_fats',
            'is_active', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'nutritionist']

    def create(self, validated_data):
        # O nutricionista ser definido automaticamente no viewset
        return super().create(validated_data)


class DietSerializer(serializers.ModelSerializer):
    meals_rel = MealSerializer(many=True, read_only=True)  # Atualizado para usar o novo related_name
    total_refeicoes = serializers.ReadOnlyField()
    tem_substituicoes = serializers.ReadOnlyField()

    class Meta:
        model = Diet
        fields = [
            'id', 'patient', 'name', 'goal', 'instructions',
            'tmb', 'gcdt', 'target_calories', 'diet_type', 'calculation_method',
            'target_protein', 'target_carbs', 'target_fats',
            'meals', 'substitutions', 'notes',
            'is_active', 'created_at', 'updated_at',
            'meals_rel', 'total_refeicoes', 'tem_substituicoes'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DefaultPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultPreset
        fields = [
            'id', 'meal_type', 'diet_type', 'preset', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'nutritionist']

    def create(self, validated_data):
        # O nutricionista será definido automaticamente no viewset
        request = self.context.get('request')
        if request:
            validated_data['nutritionist'] = request.user
        return super().create(validated_data)
