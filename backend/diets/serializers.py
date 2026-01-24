from rest_framework import serializers
from .models import (
    AlimentoTACO,
    AlimentoTBCA,
    AlimentoUSDA,
    Diet,
    Meal,
    FoodItem,
    MealPreset,
    DefaultPreset,
    FoodSubstitutionGroup,
    FoodSubstitution,
    FoodSubstitutionRule,
    NutritionistSubstitutionFavorite,
)


class AlimentoTACOSerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()

    class Meta:
        model = AlimentoTACO
        fields = [
            "id",
            "codigo",
            "nome",
            "grupo",
            "source",
            "energia_kcal",
            "proteina_g",
            "lipidios_g",
            "carboidrato_g",
            "fibra_g",
            "calcio_mg",
            "ferro_mg",
            "sodio_mg",
            "vitamina_c_mg",
            "unidade_caseira",
            "peso_unidade_caseira_g",
        ]

    def get_source(self, obj):
        return "TACO"


class AlimentoTBCASerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()

    class Meta:
        model = AlimentoTBCA
        fields = [
            "id",
            "codigo",
            "nome",
            "grupo",
            "source",
            "energia_kcal",
            "proteina_g",
            "lipidios_g",
            "carboidrato_g",
            "fibra_g",
            "calcio_mg",
            "ferro_mg",
            "sodio_mg",
            "vitamina_c_mg",
            "vitamina_a_mcg",
            "unidade_caseira",
            "peso_unidade_caseira_g",
        ]

    def get_source(self, obj):
        return "TBCA"


class AlimentoUSDASerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()
    grupo = serializers.CharField(source="categoria", read_only=True)

    class Meta:
        model = AlimentoUSDA
        fields = [
            "id",
            "fdc_id",
            "nome",
            "grupo",
            "categoria",
            "source",
            "energia_kcal",
            "proteina_g",
            "lipidios_g",
            "carboidrato_g",
            "fibra_g",
            "calcio_mg",
            "ferro_mg",
            "sodio_mg",
            "vitamina_c_mg",
            "vitamina_a_mcg",
            "vitamina_d_mcg",
            "porcao_padrao_g",
        ]

    def get_source(self, obj):
        return "USDA"


# Unified Food Serializer for search results
class UnifiedFoodSerializer(serializers.Serializer):
    """Serializer unificado para resultados de busca de alimentos."""

    id = serializers.CharField()
    nome = serializers.CharField()
    grupo = serializers.CharField()
    source = serializers.SerializerMethodField()
    energia_kcal = serializers.FloatField()
    proteina_g = serializers.FloatField()
    lipidios_g = serializers.FloatField()
    carboidrato_g = serializers.FloatField()
    fibra_g = serializers.FloatField(allow_null=True)
    unidade_caseira = serializers.CharField(allow_null=True, required=False)
    peso_unidade_caseira_g = serializers.FloatField(allow_null=True, required=False)

    def get_source(self, obj):
        if hasattr(obj, "source"):
            return obj.source

        classname = obj.__class__.__name__
        if "TACO" in classname:
            return "TACO"
        if "TBCA" in classname:
            return "TBCA"
        if "USDA" in classname:
            return "USDA"
        if "IBGE" in classname or "MedidaIBGE" in classname:
            return "IBGE"

        return "TACO"  # Default fallback


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "id",
            "food_name",
            "quantity",
            "unit",
            "calories",
            "protein",
            "carbs",
            "fats",
            "fiber",
            "taco_food",
            "tbca_food",
            "usda_food",
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
            "id",
            "name",
            "time",
            "day_of_week",
            "order",
            "notes",
            "items",
            "total_calorias",
            "total_proteinas",
            "total_carboidratos",
            "total_gorduras",
        ]


class MealPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPreset
        fields = [
            "id",
            "name",
            "meal_type",
            "diet_type",
            "description",
            "foods",
            "total_calories",
            "total_protein",
            "total_carbs",
            "total_fats",
            "is_active",
            "is_public",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "nutritionist"]

    def create(self, validated_data):
        # O nutricionista será definido automaticamente no viewset
        request = self.context.get("request")
        if request:
            validated_data["nutritionist"] = request.user
        return super().create(validated_data)


class DietSerializer(serializers.ModelSerializer):
    meals_rel = MealSerializer(many=True, read_only=True)
    nutritionist = serializers.ReadOnlyField(source="patient.nutritionist.name")

    class Meta:
        model = Diet
        fields = [
            "id",
            "name",
            "goal",
            "instructions",
            "diet_type",
            "calculation_method",
            "target_calories",
            "target_protein",
            "target_carbs",
            "target_fats",
            "tmb",
            "gcdt",
            "pdf_file",
            "is_active",
            "patient",
            "nutritionist",
            "meals",
            "meals_rel",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        return super().create(validated_data)


class DefaultPresetSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source="preset.name")
    description = serializers.ReadOnlyField(source="preset.description")
    foods = serializers.ReadOnlyField(source="preset.foods")
    total_calories = serializers.ReadOnlyField(source="preset.total_calories")
    total_protein = serializers.ReadOnlyField(source="preset.total_protein")
    total_carbs = serializers.ReadOnlyField(source="preset.total_carbs")
    total_fats = serializers.ReadOnlyField(source="preset.total_fats")

    class Meta:
        model = DefaultPreset
        fields = [
            "id",
            "preset",
            "name",
            "meal_type",
            "diet_type",
            "description",
            "foods",
            "total_calories",
            "total_protein",
            "total_carbs",
            "total_fats",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "nutritionist"]

    def create(self, validated_data):
        # O nutricionista será definido automaticamente no viewset
        request = self.context.get("request")
        if request:
            validated_data["nutritionist"] = request.user
        return super().create(validated_data)


# =============================================================================
# SERIALIZERS DE SUBSTITUIÇÃO DE ALIMENTOS
# =============================================================================


class ToggleFavoriteSerializer(serializers.Serializer):
    """Serializer para alternar favorito"""

    pass


class FoodSubstitutionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodSubstitutionGroup
        fields = [
            "id",
            "name",
            "predominant_nutrient",
            "description",
            "is_active",
            "created_at",
            "updated_at",
        ]


class SubstitutionOptionSerializer(serializers.Serializer):
    """Serializer para uma opção de substituição com cálculo de equivalência"""

    substitute_food_id = serializers.CharField()
    substitute_food_name = serializers.CharField()
    substitute_source = serializers.CharField()
    equivalent_quantity_g = serializers.FloatField()
    equivalent_quantity_display = serializers.CharField()
    predominant_nutrient = serializers.CharField()
    macros = serializers.DictField()
    original_macros = serializers.DictField()


class SubstitutionResponseSerializer(serializers.Serializer):
    """Serializer para resposta da API de substituições"""

    original_food = serializers.DictField()
    substitutions = SubstitutionOptionSerializer(many=True)


class ApplySubstitutionSerializer(serializers.Serializer):
    """Serializer para aplicar uma substituição"""

    substitute_food_id = serializers.CharField(required=True)
    substitute_food_name = serializers.CharField(required=True)
    substitute_source = serializers.CharField(required=True)
    equivalent_quantity_g = serializers.FloatField(required=True)
    macros = serializers.DictField(required=True)


# =============================================================================
# SERIALIZERS LEGADOS (PARA COMPATIBILIDADE)
# =============================================================================


class FoodSubstitutionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodSubstitutionRule
        fields = "__all__"
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class NutritionistSubstitutionFavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionistSubstitutionFavorite
        fields = "__all__"
        read_only_fields = ["nutritionist", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request:
            validated_data["nutritionist"] = request.user
        return super().create(validated_data)
