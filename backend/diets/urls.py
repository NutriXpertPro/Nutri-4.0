from django.urls import path
from . import views

app_name = "diets"

urlpatterns = [
    # Food search
    path("foods/", views.FoodSearchViewSet.as_view({"get": "list"}), name="food-list"),
    path(
        "foods/grupos/",
        views.FoodSearchViewSet.as_view({"get": "grupos"}),
        name="food-grupos",
    ),
    path(
        "foods/favorites/",
        views.FoodSearchViewSet.as_view({"get": "favorites"}),
        name="food-favorites",
    ),
    path(
        "toggle-favorite/", views.ToggleFavoriteView.as_view(), name="toggle-favorite"
    ),
    # Diet CRUD
    path(
        "",
        views.DietViewSet.as_view({"get": "list", "post": "create"}),
        name="diet-list",
    ),
    path(
        "<int:pk>/",
        views.DietViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="diet-detail",
    ),
    # Meals
    path(
        "meals/",
        views.MealViewSet.as_view({"get": "list", "post": "create"}),
        name="meal-list",
    ),
    path(
        "meals/<int:pk>/",
        views.MealViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="meal-detail",
    ),
    # Food Items
    path(
        "food-items/",
        views.FoodItemViewSet.as_view({"get": "list", "post": "create"}),
        name="fooditem-list",
    ),
    path(
        "food-items/<int:pk>/",
        views.FoodItemViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="fooditem-detail",
    ),
    # Meal Presets
    path(
        "meal-presets/",
        views.MealPresetViewSet.as_view({"get": "list", "post": "create"}),
        name="meal-preset-list",
    ),
    path(
        "meal-presets/<int:pk>/",
        views.MealPresetViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="meal-preset-detail",
    ),
    # Default Presets
    path(
        "default-presets/",
        views.DefaultPresetViewSet.as_view({"get": "list", "post": "create"}),
        name="default-preset-list",
    ),
    path(
        "default-presets/<int:pk>/",
        views.DefaultPresetViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="default-preset-detail",
    ),
    # Food Substitutions (Tabela Global)
    path(
        "substitutions/",
        views.FoodSubstitutionRuleViewSet.as_view({"get": "list", "post": "create"}),
        name="substitution-list",
    ),
    path(
        "substitutions/<int:pk>/",
        views.FoodSubstitutionRuleViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="substitution-detail",
    ),
    path(
        "substitutions/suggest/",
        views.FoodSubstitutionRuleViewSet.as_view({"get": "suggest"}),
        name="substitution-suggest",
    ),
    path(
        "substitutions/toggle-favorite/",
        views.FoodSubstitutionRuleViewSet.as_view({"post": "toggle_favorite"}),
        name="substitution-toggle-favorite",
    ),
    path(
        "substitutions/save-selection/",
        views.FoodSubstitutionRuleViewSet.as_view({"post": "save_selection"}),
        name="substitution-save-selection",
    ),
    # Nutritionist Favorites
    path(
        "substitution-favorites/",
        views.NutritionistSubstitutionFavoriteViewSet.as_view(
            {"get": "list", "post": "create"}
        ),
        name="substitution-favorite-list",
    ),
    path(
        "substitution-favorites/<int:pk>/",
        views.NutritionistSubstitutionFavoriteViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="substitution-favorite-detail",
    ),
    # Food Substitution Groups
    path(
        "substitution-groups/",
        views.FoodSubstitutionGroupViewSet.as_view({"get": "list", "post": "create"}),
        name="substitution-group-list",
    ),
    path(
        "substitution-groups/<int:pk>/",
        views.FoodSubstitutionGroupViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "delete": "destroy"}
        ),
        name="substitution-group-detail",
    ),
    # Meal Food Substitutions (por refeição)
    path(
        "meals/<int:meal_id>/foods/<int:food_item_id>/substitutes/",
        views.FoodSubstitutionsViewSet.as_view({"get": "list"}),
        name="meal-food-substitutes",
    ),
    path(
        "meals/<int:meal_id>/foods/<int:food_item_id>/apply-substitution/",
        views.FoodSubstitutionsViewSet.as_view({"post": "apply"}),
        name="meal-food-apply-substitution",
    ),
]
