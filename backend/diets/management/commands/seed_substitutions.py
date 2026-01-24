from django.core.management.base import BaseCommand
from diets.models import FoodSubstitutionRule
from users.models import User


class Command(BaseCommand):
    help = "Cria dados de substituição de alimentos"

    def handle(self, *args, **options):
        self.stdout.write("Criando substituições de alimentos...")

        # Buscar qualquer usuário
        admin_user = User.objects.first()

        if not admin_user:
            self.stdout.write("Erro: Nenhum usuário encontrado!")
            return

        substitutions_data = [
            # ==================== CETOGÊNICA ====================
            {
                "original_source": "TACO",
                "original_food_id": "1002",
                "original_food_name": "Peito de frango grelhado",
                "substitute_source": "TACO",
                "substitute_food_id": "1023",
                "substitute_food_name": "Filé de salmão",
                "diet_type": "cetogenica",
                "nutrient_predominant": "protein",
                "similarity_score": 0.92,
                "conversion_factor": 1.0,
                "suggested_quantity": 100,
                "priority": 10,
                "notes": "Ambos são excelentes fontes de proteína com baixo carboidrato",
            },
            {
                "original_source": "TACO",
                "original_food_id": "1501",
                "original_food_name": "Arroz branco cozido",
                "substitute_source": "TACO",
                "substitute_food_id": "2501",
                "substitute_food_name": "Brócolis cozido",
                "diet_type": "cetogenica",
                "nutrient_predominant": "carb",
                "similarity_score": 0.68,
                "conversion_factor": 1.8,
                "suggested_quantity": 180,
                "priority": 20,
                "notes": "Brócolis tem muito menos carboidrato que arroz",
            },
            # ==================== LOW CARB ====================
            {
                "original_source": "TACO",
                "original_food_id": "1501",
                "original_food_name": "Arroz branco cozido",
                "substitute_source": "TACO",
                "substitute_food_id": "2501",
                "substitute_food_name": "Brócolis cozido",
                "diet_type": "low_carb",
                "nutrient_predominant": "carb",
                "similarity_score": 0.68,
                "conversion_factor": 1.8,
                "suggested_quantity": 180,
                "priority": 15,
                "notes": "Brócolis tem menos carboidrato que arroz e mais fibras",
            },
            # ==================== NORMOCALÓRICA ====================
            {
                "original_source": "TACO",
                "original_food_id": "1002",
                "original_food_name": "Peito de frango grelhado",
                "substitute_source": "TACO",
                "substitute_food_id": "2001",
                "substitute_food_name": "Carne moída patinho",
                "diet_type": "normocalorica",
                "nutrient_predominant": "protein",
                "similarity_score": 0.90,
                "conversion_factor": 1.0,
                "suggested_quantity": 100,
                "priority": 10,
                "notes": "Ambos são excelentes fontes de proteína magra",
            },
            # ==================== HIGH CARB ====================
            {
                "original_source": "TACO",
                "original_food_id": "1501",
                "original_food_name": "Arroz branco cozido",
                "substitute_source": "TACO",
                "substitute_food_id": "3001",
                "substitute_food_name": "Pão francês",
                "diet_type": "high_carb",
                "nutrient_predominant": "carb",
                "similarity_score": 0.88,
                "conversion_factor": 1.2,
                "suggested_quantity": 80,
                "priority": 15,
                "notes": "Pão é uma excelente fonte de carboidratos",
            },
            # ==================== VEGETARIANA ====================
            {
                "original_source": "TACO",
                "original_food_id": "2001",
                "original_food_name": "Carne moída",
                "substitute_source": "TACO",
                "substitute_food_id": "4001",
                "substitute_food_name": "Grão-de-bico cozido",
                "diet_type": "vegetariana",
                "nutrient_predominant": "protein",
                "similarity_score": 0.75,
                "conversion_factor": 0.8,
                "suggested_quantity": 80,
                "priority": 10,
                "notes": "Grão-de-bico é uma excelente proteína vegetal",
            },
            # ==================== VEGANA ====================
            {
                "original_source": "TACO",
                "original_food_id": "2001",
                "original_food_name": "Carne moída",
                "substitute_source": "TACO",
                "substitute_food_id": "5001",
                "substitute_food_name": "Lentilha cozida",
                "diet_type": "vegana",
                "nutrient_predominant": "protein",
                "similarity_score": 0.78,
                "conversion_factor": 0.7,
                "suggested_quantity": 70,
                "priority": 10,
                "notes": "Lentilha é excelente fonte de proteína vegana",
            },
            # ==================== SEM GLÚTEN ====================
            {
                "original_source": "TACO",
                "original_food_id": "3001",
                "original_food_name": "Pão de trigo",
                "substitute_source": "TACO",
                "substitute_food_id": "6001",
                "substitute_food_name": "Pão de arroz",
                "diet_type": "sem_gluten",
                "nutrient_predominant": "carb",
                "similarity_score": 0.85,
                "conversion_factor": 1.1,
                "suggested_quantity": 110,
                "priority": 10,
                "notes": "Pão de arroz é sem glúten",
            },
            # ==================== HIPERPROTEICA ====================
            {
                "original_source": "TACO",
                "original_food_id": "1002",
                "original_food_name": "Peito de frango grelhado",
                "substitute_source": "TACO",
                "substitute_food_id": "2001",
                "substitute_food_name": "Carne moída patinho",
                "diet_type": "hiperproteica",
                "nutrient_predominant": "protein",
                "similarity_score": 0.92,
                "conversion_factor": 1.0,
                "suggested_quantity": 100,
                "priority": 10,
                "notes": "Ambos são ótimas fontes de proteína",
            },
            # ==================== MEDITERRÂNEA ====================
            {
                "original_source": "TACO",
                "original_food_id": "1002",
                "original_food_name": "Peito de frango grelhado",
                "substitute_source": "TACO",
                "substitute_food_id": "1023",
                "substitute_food_name": "Filé de salmão",
                "diet_type": "mediterranea",
                "nutrient_predominant": "protein",
                "similarity_score": 0.94,
                "conversion_factor": 1.0,
                "suggested_quantity": 100,
                "priority": 10,
                "notes": "Peixe é um pilar da dieta mediterrânea",
            },
        ]

        created = 0
        for data in substitutions_data:
            obj, created_now = FoodSubstitutionRule.objects.get_or_create(
                original_source=data["original_source"],
                original_food_id=data["original_food_id"],
                substitute_source=data["substitute_source"],
                substitute_food_id=data["substitute_food_id"],
                diet_type=data["diet_type"],
                defaults={
                    "original_food_name": data["original_food_name"],
                    "substitute_food_name": data["substitute_food_name"],
                    "nutrient_predominant": data["nutrient_predominant"],
                    "similarity_score": data["similarity_score"],
                    "conversion_factor": data["conversion_factor"],
                    "suggested_quantity": data["suggested_quantity"],
                    "priority": data["priority"],
                    "notes": data["notes"],
                    "created_by": admin_user,
                    "is_active": True,
                },
            )

            if created_now:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Sucesso! {created} substituições criadas.")
        )
        self.stdout.write(
            f"Total de substituições no banco: {FoodSubstitutionRule.objects.count()}"
        )
