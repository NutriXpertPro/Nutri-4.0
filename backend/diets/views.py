from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from itertools import chain

from .models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA, Diet, Meal, FoodItem
from .serializers import (
    AlimentoTACOSerializer, AlimentoTBCASerializer, AlimentoUSDASerializer,
    UnifiedFoodSerializer, DietSerializer, MealSerializer, FoodItemSerializer
)


class FoodSearchViewSet(viewsets.ViewSet):
    """
    ViewSet para busca unificada de alimentos em todas as tabelas (TACO, TBCA, USDA).
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """
        GET /api/v1/foods/?search=arroz&source=TACO&limit=50
        Busca alimentos em todas as tabelas ou em uma específica.
        """
        search_query = request.query_params.get('search', '').strip()
        source_filter = request.query_params.get('source', '').upper()
        grupo_filter = request.query_params.get('grupo', '')
        limit = int(request.query_params.get('limit', 50))
        
        if len(search_query) < 2:
            return Response(
                {"error": "A busca deve ter pelo menos 2 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        
        # Search TACO
        if not source_filter or source_filter == 'TACO':
            taco_qs = AlimentoTACO.objects.filter(nome__icontains=search_query)
            if grupo_filter:
                taco_qs = taco_qs.filter(grupo__icontains=grupo_filter)
            for item in taco_qs[:limit]:
                results.append({
                    'id': item.id,
                    'nome': item.nome,
                    'grupo': item.grupo,
                    'source': 'TACO',
                    'energia_kcal': item.energia_kcal,
                    'proteina_g': item.proteina_g,
                    'lipidios_g': item.lipidios_g,
                    'carboidrato_g': item.carboidrato_g,
                    'fibra_g': item.fibra_g,
                    'unidade_caseira': item.unidade_caseira,
                    'peso_unidade_caseira_g': item.peso_unidade_caseira_g,
                })
        
        # Search TBCA
        if not source_filter or source_filter == 'TBCA':
            tbca_qs = AlimentoTBCA.objects.filter(nome__icontains=search_query)
            if grupo_filter:
                tbca_qs = tbca_qs.filter(grupo__icontains=grupo_filter)
            for item in tbca_qs[:limit]:
                results.append({
                    'id': item.id,
                    'nome': item.nome,
                    'grupo': item.grupo,
                    'source': 'TBCA',
                    'energia_kcal': item.energia_kcal,
                    'proteina_g': item.proteina_g,
                    'lipidios_g': item.lipidios_g,
                    'carboidrato_g': item.carboidrato_g,
                    'fibra_g': item.fibra_g,
                    'unidade_caseira': item.unidade_caseira,
                    'peso_unidade_caseira_g': item.peso_unidade_caseira_g,
                })
        
        # Search USDA
        if not source_filter or source_filter == 'USDA':
            usda_qs = AlimentoUSDA.objects.filter(nome__icontains=search_query)
            if grupo_filter:
                usda_qs = usda_qs.filter(categoria__icontains=grupo_filter)
            for item in usda_qs[:limit]:
                results.append({
                    'id': item.id,
                    'nome': item.nome,
                    'grupo': item.categoria,
                    'source': 'USDA',
                    'energia_kcal': item.energia_kcal,
                    'proteina_g': item.proteina_g,
                    'lipidios_g': item.lipidios_g,
                    'carboidrato_g': item.carboidrato_g,
                    'fibra_g': item.fibra_g,
                    'unidade_caseira': None,
                    'peso_unidade_caseira_g': item.porcao_padrao_g,
                })
        
        # Sort by name and limit
        results = sorted(results, key=lambda x: x['nome'])[:limit]
        
        return Response({
            'count': len(results),
            'results': results
        })
    
    @action(detail=False, methods=['GET'])
    def grupos(self, request):
        """
        GET /api/v1/foods/grupos/
        Retorna todos os grupos/categorias disponíveis.
        """
        taco_grupos = set(AlimentoTACO.objects.values_list('grupo', flat=True).distinct())
        tbca_grupos = set(AlimentoTBCA.objects.values_list('grupo', flat=True).distinct())
        usda_grupos = set(AlimentoUSDA.objects.values_list('categoria', flat=True).distinct())
        
        all_grupos = sorted(taco_grupos | tbca_grupos | usda_grupos)
        
        return Response({'grupos': all_grupos})


class DietViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de dietas."""
    serializer_class = DietSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Diet.objects.filter(patient__nutritionist=self.request.user)
        
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


class MealViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de refeições."""
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Meal.objects.filter(diet__patient__nutritionist=self.request.user)
        
        diet_id = self.request.query_params.get('diet')
        if diet_id:
            queryset = queryset.filter(diet_id=diet_id)
        
        return queryset


class FoodItemViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de itens alimentares."""
    serializer_class = FoodItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = FoodItem.objects.filter(meal__diet__patient__nutritionist=self.request.user)
        
        meal_id = self.request.query_params.get('meal')
        if meal_id:
            queryset = queryset.filter(meal_id=meal_id)
        
        return queryset
