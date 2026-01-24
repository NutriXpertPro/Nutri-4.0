from django.contrib import admin
from .models import (
    Diet,
    AlimentoTACO,
    AlimentoTBCA,
    AlimentoUSDA,
    DefaultPreset,
    FoodSubstitutionRule,
    NutritionistSubstitutionFavorite,
)


@admin.register(Diet)
class DietAdmin(admin.ModelAdmin):
    list_display = ("name", "patient", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("name", "patient__user__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AlimentoTACO)
class AlimentoTACOAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "grupo",
        "energia_kcal",
        "proteina_g",
        "carboidrato_g",
        "lipidios_g",
    )
    list_filter = ("grupo",)
    search_fields = ("nome", "grupo")


@admin.register(AlimentoTBCA)
class AlimentoTBCAAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "grupo",
        "energia_kcal",
        "proteina_g",
        "carboidrato_g",
        "lipidios_g",
    )
    list_filter = ("grupo",)
    search_fields = ("nome", "grupo", "codigo")


@admin.register(AlimentoUSDA)
class AlimentoUSDAAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "categoria",
        "energia_kcal",
        "proteina_g",
        "carboidrato_g",
        "lipidios_g",
    )
    list_filter = ("categoria",)
    search_fields = ("nome", "categoria", "fdc_id")


@admin.register(DefaultPreset)
class DefaultPresetAdmin(admin.ModelAdmin):
    list_display = (
        "nutritionist",
        "meal_type",
        "diet_type",
        "preset",
        "is_active",
        "created_at",
    )
    list_filter = ("meal_type", "diet_type", "is_active", "created_at")
    search_fields = ("nutritionist__name", "nutritionist__email", "preset__name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(FoodSubstitutionRule)
class FoodSubstitutionRuleAdmin(admin.ModelAdmin):
    list_display = (
        "original_food_name",
        "substitute_food_name",
        "diet_type",
        "nutrient_predominant",
        "similarity_score",
        "is_active",
        "created_at",
    )
    list_filter = ("diet_type", "nutrient_predominant", "is_active", "created_at")
    search_fields = (
        "original_food_name",
        "substitute_food_name",
        "created_by__name",
        "created_by__email",
    )
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        (
            None,
            {"fields": ("original_source", "original_food_id", "original_food_name")},
        ),
        (
            "Substituição",
            {
                "fields": (
                    "substitute_source",
                    "substitute_food_id",
                    "substitute_food_name",
                )
            },
        ),
        ("Contexto da Dieta", {"fields": ("diet_type", "nutrient_predominant")}),
        (
            "Critérios Nutricionais",
            {"fields": ("similarity_score", "conversion_factor", "suggested_quantity")},
        ),
        ("Metadata", {"fields": ("priority", "is_active", "notes", "created_by")}),
    )


@admin.register(NutritionistSubstitutionFavorite)
class NutritionistSubstitutionFavoriteAdmin(admin.ModelAdmin):
    list_display = (
        "nutritionist",
        "original_food_name",
        "substitute_food_name",
        "diet_type",
        "similarity_score",
        "is_active",
        "created_at",
    )
    list_filter = ("diet_type", "is_active", "created_at")
    search_fields = (
        "nutritionist__name",
        "nutritionist__email",
        "original_food_name",
        "substitute_food_name",
    )
    readonly_fields = ("created_at", "updated_at")
