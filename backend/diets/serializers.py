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
    CustomFood,
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
    meals_data = serializers.ListField(write_only=True, required=False)
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
            "meals_data",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def _process_meals_data(self, diet, meals_data):
        """Helper para criar/atualizar refeições e itens a partir do JSON."""
        if not meals_data:
            return

        # Para simplificar e garantir consistência, vamos recriar as refeições
        # (Em apps reais, poderíamos fazer diffing, mas para dietas completas
        #  recriar é mais seguro para evitar itens órfãos).
        diet.meals_rel.all().delete()

        for meal_json in meals_data:
            # Frontend sends keys in English matching the store structure
            meal_obj = Meal.objects.create(
                diet=diet,
                name=meal_json.get("name", "Refeição"),
                time=meal_json.get("time", "00:00"),
                order=meal_json.get("order", 0),
                day_of_week=meal_json.get("day_of_week", 0),
                notes=meal_json.get("notes", ""),
            )

            # Frontend sends 'items', not 'alimentos'
            items_list = meal_json.get("items", [])
            
            for food_json in items_list:
                FoodItem.objects.create(
                    meal=meal_obj,
                    food_name=food_json.get("food_name", "Alimento"),
                    quantity=food_json.get("quantity", 0),
                    unit=food_json.get("unit", "g"),
                    calories=food_json.get("calories", 0),
                    protein=food_json.get("protein", 0),
                    carbs=food_json.get("carbs", 0),
                    fats=food_json.get("fats", 0),
                    fiber=food_json.get("fiber", 0),
                )

    def create(self, validated_data):
        meals_data = validated_data.pop("meals_data", None)
        diet = super().create(validated_data)
        if meals_data:
            self._process_meals_data(diet, meals_data)
        return diet

    def update(self, instance, validated_data):
        meals_data = validated_data.pop("meals_data", None)
        diet = super().update(instance, validated_data)
        if meals_data:
            self._process_meals_data(diet, meals_data)
        return diet


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


class CustomFoodSerializer(serializers.ModelSerializer):
    source = serializers.ReadOnlyField(default="Sua Tabela")

    class Meta:
        model = CustomFood
        fields = [
            "id",
            "nome",
            "grupo",
            "energia_kcal",
            "proteina_g",
            "lipidios_g",
            "carboidrato_g",
            "fibra_g",
            "unidade_caseira",
            "peso_unidade_caseira_g",
            "source",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "source"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request:
            validated_data["nutritionist"] = request.user
        return super().create(validated_data)
