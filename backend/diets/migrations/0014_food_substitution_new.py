# Generated migration for food substitution models (0014)

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("diets", "0012_foodsubstitutionrule_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="FoodSubstitutionGroup",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("predominant_nutrient", models.CharField(max_length=20)),
                ("description", models.TextField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Grupo de Substituicao",
                "verbose_name_plural": "Grupos de Substituicao",
            },
        ),
        migrations.CreateModel(
            name="FoodSubstitution",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("original_source", models.CharField(max_length=50)),
                ("original_food_id", models.CharField(max_length=100)),
                ("original_food_name", models.CharField(max_length=255)),
                ("substitute_source", models.CharField(max_length=50)),
                ("substitute_food_id", models.CharField(max_length=100)),
                ("substitute_food_name", models.CharField(max_length=255)),
                ("substitute_calories_per_100g", models.FloatField()),
                ("substitute_protein_per_100g", models.FloatField()),
                ("substitute_carbs_per_100g", models.FloatField()),
                ("substitute_fat_per_100g", models.FloatField()),
                ("substitute_fiber_per_100g", models.FloatField(default=0)),
                ("is_approved", models.BooleanField(default=True)),
                ("order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "group",
                    models.ForeignKey(
                        to="diets.foodsubstitutiongroup",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="substitutions",
                    ),
                ),
            ],
            options={
                "verbose_name": "Substituicao de Alimento",
                "verbose_name_plural": "Substituicoes de Alimentos",
                "unique_together": {
                    (
                        "original_source",
                        "original_food_id",
                        "substitute_source",
                        "substitute_food_id",
                    )
                },
                "ordering": ["group", "order", "substitute_food_name"],
            },
        ),
    ]
