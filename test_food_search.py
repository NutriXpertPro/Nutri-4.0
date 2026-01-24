#!/usr/bin/env python
# Test script to validate the improved food search functionality

import os
import sys
import django
import json

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'setup.settings')
django.setup()

from backend.diets.views import FoodSearchViewSet
from backend.diets.models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA
from backend.diets.search_utils import normalizar_para_scoring

def test_search_functionality():
    """Test the search functionality with various search terms"""
    
    print("Testing Improved Food Search Functionality")
    print("=" * 50)
    
    # Create a mock request object
    class MockRequest:
        def __init__(self):
            self.query_params = {}
            self.user = None
    
    # Initialize the viewset
    viewset = FoodSearchViewSet()
    
    # Test cases for search terms
    test_cases = [
        "file de frango",
        "frango peito",
        "arroz integral",
        "batata doce",
        "feijao carioca",
        "ovo cozido"
    ]
    
    for search_term in test_cases:
        print(f"\nTesting search term: '{search_term}'")
        print("-" * 30)
        
        # Create mock request with search term
        request = MockRequest()
        request.query_params = {"search": search_term}
        
        try:
            # Call the search functionality
            # Since we can't call the list method directly without a real request,
            # we'll simulate the search process by calling the internal functions
            search_query = search_term.strip()
            
            if len(search_query) < 2:
                print("  Search query too short (minimum 2 characters)")
                continue
                
            q_tokens = normalizar_para_scoring(search_query)
            print(f"  Normalized tokens: {q_tokens}")
            
            # Test with sample foods from the database
            sample_foods = []
            
            # Get some sample foods from TACO
            taco_foods = AlimentoTACO.objects.filter(nome__icontains=search_query.split()[0])[:5]
            for food in taco_foods:
                sample_foods.append({
                    "id": food.codigo,
                    "nome": food.nome,
                    "grupo": food.grupo,
                    "source": "TACO",
                    "energia_kcal": food.energia_kcal,
                    "proteina_g": food.proteina_g,
                    "lipidios_g": food.lipidios_g,
                    "carboidrato_g": food.carboidrato_g,
                    "fibra_g": food.fibra_g,
                })
            
            # Print sample results
            print(f"  Found {len(sample_foods)} sample foods matching '{search_query.split()[0]}'")
            for i, food in enumerate(sample_foods[:3]):  # Show first 3
                print(f"    {i+1}. {food['nome']} [{food['grupo']}]")
                
        except Exception as e:
            print(f"  Error during search test: {str(e)}")
    
    print("\n" + "=" * 50)
    print("Search functionality test completed!")

if __name__ == "__main__":
    test_search_functionality()