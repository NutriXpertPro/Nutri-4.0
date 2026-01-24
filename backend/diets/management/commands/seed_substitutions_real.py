from django.core.management.base import BaseCommand
from diets.models import FoodSubstitutionRule
from users.models import User


class Command(BaseCommand):
    help = "Cria substituições baseadas em alimentos existentes"

    def handle(self, *args, **options):
        self.stdout.write("Criando substituições baseadas em alimentos existentes...")

        admin_user = User.objects.first()

        if not admin_user:
            self.stdout.write("Erro: Nenhum usuário encontrado!")
            return

        from diets.models import AlimentoTACO

        # Buscar alguns alimentos existentes
        foods = list(AlimentoTACO.objects.all()[:20])

        if len(foods) < 2:
            self.stdout.write("Erro: Menos de 2 alimentos encontrados!")
            return

        self.stdout.write(f"Encontrados {len(foods)} alimentos TACO")

        # Criar substituições simples
        created = 0

        # Substituição 1
        if len(foods) >= 2:
            FoodSubstitutionRule.objects.get_or_create(
                original_source="TACO",
                original_food_id=str(foods[0].id),
                substitute_source="TACO",
                substitute_food_id=str(foods[1].id),
                diet_type="normocalorica",
                defaults={
                    "original_food_name": foods[0].nome,
                    "substitute_food_name": foods[1].nome,
                    "nutrient_predominant": "carb",
                    "similarity_score": 0.85,
                    "conversion_factor": 1.0,
                    "suggested_quantity": 100,
                    "priority": 10,
                    "notes": "Substituição base",
                    "created_by": admin_user,
                    "is_active": True,
                },
            )
            created += 1

        # Substituição 2 (reversa)
        FoodSubstitutionRule.objects.get_or_create(
            original_source="TACO",
            original_food_id=str(foods[1].id),
            substitute_source="TACO",
            substitute_food_id=str(foods[0].id),
            diet_type="normocalorica",
            defaults={
                "original_food_name": foods[1].nome,
                "substitute_food_name": foods[0].nome,
                "nutrient_predominant": "carb",
                "similarity_score": 0.85,
                "conversion_factor": 1.0,
                "suggested_quantity": 100,
                "priority": 10,
                "notes": "Substituição reversa",
                "created_by": admin_user,
                "is_active": True,
            },
        )
        created += 1

        # Substituição 3 (Low Carb)
        if len(foods) >= 2:
            FoodSubstitutionRule.objects.get_or_create(
                original_source="TACO",
                original_food_id=str(foods[0].id),
                substitute_source="TACO",
                substitute_food_id=str(foods[1].id),
                diet_type="low_carb",
                defaults={
                    "original_food_name": foods[0].nome,
                    "substitute_food_name": foods[1].nome,
                    "nutrient_predominant": "carb",
                    "similarity_score": 0.75,
                    "conversion_factor": 1.2,
                    "suggested_quantity": 120,
                    "priority": 10,
                    "notes": "Low carb option",
                    "created_by": admin_user,
                    "is_active": True,
                },
            )
            created += 1

        # Substituição 4 (Cetogênica)
        if len(foods) >= 2:
            FoodSubstitutionRule.objects.get_or_create(
                original_source="TACO",
                original_food_id=str(foods[0].id),
                substitute_source="TACO",
                substitute_food_id=str(foods[1].id),
                diet_type="cetogenica",
                defaults={
                    "original_food_name": foods[0].nome,
                    "substitute_food_name": foods[1].nome,
                    "nutrient_predominant": "protein",
                    "similarity_score": 0.90,
                    "conversion_factor": 1.0,
                    "suggested_quantity": 100,
                    "priority": 10,
                    "notes": "Opção cetogênica",
                    "created_by": admin_user,
                    "is_active": True,
                },
            )
            created += 1

        self.stdout.write(f"Sucesso! {created} substituições criadas.")
        self.stdout.write(
            f"Total de substituições no banco: {FoodSubstitutionRule.objects.count()}"
        )
