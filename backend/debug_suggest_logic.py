
import os
import sys
import django

# Adicionar o diretório atual ao sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from diets.models import FoodSubstitutionRule, AlimentoTACO

def debug_subs():
    print("--- Analisando Regras de Substituição (CARB) ---")
    rules = FoodSubstitutionRule.objects.filter(nutrient_predominant='carb', is_active=True).order_by('-similarity_score')[:20]
    
    for r in rules:
        print(f"ID: {r.id} | Orig: {r.original_food_name or 'GENERICA'} | Subst: {r.substitute_food_name} | Score: {r.similarity_score} | Factor: {r.conversion_factor} | Note: {r.notes}")

    print("\n--- Testando Identificação de Grupo para Arroz ---")
    from patients.views_patient_data import PatientMealsViewSet
    # Simular a lógica de grupo
    arroz = AlimentoTACO.objects.filter(nome__icontains='Arroz, integral, cru').first()
    if arroz:
        print(f"Alimento: {arroz.nome} | Grupo TACO: {arroz.grupo}")
        # Copiar lógica simplificada para teste
        name = arroz.nome.lower()
        if any(x in name for x in ["arroz", "batata", "mandioca"]):
            print("Classificado como: CARB (Professional)")
    
    print("\n--- Testando Fallback de Batata Doce ---")
    batata = AlimentoTACO.objects.filter(nome__icontains='Batata, doce, cozida').first()
    if batata:
        print(f"Alimento: {batata.nome} | Calorias: {batata.energia_kcal}")
        # Arroz Rice, brown, raw is ~350 kcal. Batata is ~77 kcal.
        # Factor should be 350/77 = 4.5
        if arroz:
            factor = arroz.energia_kcal / batata.energia_kcal
            print(f"Fator de Conversão Ideal (Arroz Cru -> Batata Cozida): {factor:.2f}")

if __name__ == "__main__":
    debug_subs()
