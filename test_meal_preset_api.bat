#!/bin/bash
# Script para testar a API de MealPreset

echo "Testando a API de MealPreset..."

# Testar criação de um preset
curl -X POST http://localhost:8000/api/v1/meal-presets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Café da Manhã Low Carb",
    "meal_type": "cafe_da_manha",
    "diet_type": "lowcarb",
    "description": "Café da manhã low carb com ovos e abacate",
    "foods": [
      {
        "id": 1,
        "food_name": "Ovos",
        "quantity": 2,
        "unit": "und",
        "calories": 140,
        "protein": 12,
        "carbs": 1,
        "fats": 10
      }
    ],
    "total_calories": 140,
    "total_protein": 12,
    "total_carbs": 1,
    "total_fats": 10,
    "is_active": true
  }'

echo ""
echo "Teste concluído!"