from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination # Importado
from django.db.models import Q
from itertools import chain
import hashlib

from .models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA, Diet, Meal, FoodItem, AlimentoMedidaIBGE, MedidaCaseira
from .serializers import (
    AlimentoTACOSerializer, AlimentoTBCASerializer, AlimentoUSDASerializer,
    UnifiedFoodSerializer, DietSerializer, MealSerializer, FoodItemSerializer
)
from .models import FavoriteFood
from rest_framework.views import APIView

class ToggleFavoriteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        data = request.data
        
        food_source = data.get('source')
        food_id = str(data.get('id'))
        food_name = data.get('nome')
        
        if not all([food_source, food_id]):
            return Response({'error': 'Dados incompletos'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Tentar encontrar
        favorite = FavoriteFood.objects.filter(user=user, food_source=food_source, food_id=food_id).first()
        
        if favorite:
            favorite.delete()
            return Response({'is_favorite': False})
        else:
            FavoriteFood.objects.create(
                user=user,
                food_source=food_source,
                food_id=food_id,
                food_name=food_name or 'Alimento'
            )
            return Response({'is_favorite': True})


class FoodPageNumberPagination(PageNumberPagination):
    page_size = 20  # Reduzido para melhor desempenho
    page_size_query_param = 'page_size'
    max_page_size = 100  # Reduzido para evitar abusos e sobrecarga

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
        # Remove manual limit handling as pagination will take care of it

        if len(search_query) < 2:
            return Response(
                {"error": "A busca deve ter pelo menos 2 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Proteção contra buscas excessivamente amplas
        if len(search_query) > 50:
            return Response(
                {"error": "A busca é muito longa. Máximo de 50 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mapa de favoritos do usuário para lookup O(1)
        # Formato: "SOURCE_ID" -> True
        user_fav_keys = set()
        ibge_fav_names = set()
        if request.user.is_authenticated:
            favs = FavoriteFood.objects.filter(user=request.user)
            for f in favs:
                # Normaliza chave: "TACO_1", "IBGE_123456"
                user_fav_keys.add(f"{f.food_source}_{f.food_id}")
                if f.food_source == 'IBGE':
                    ibge_fav_names.add(f.food_name)

        results = []

        # Cache global simples para evitar N+1 queries no IBGE
        # Isso carrega +- 10k itens na memória (muito leve) e evita 30-100 queries por request
        if not hasattr(FoodSearchViewSet, 'IBGE_CACHE'):
            FoodSearchViewSet.IBGE_CACHE = []
            
        def ensure_cache():
            if not FoodSearchViewSet.IBGE_CACHE:
                try:
                    # Carrega tudo de uma vez (aprox 10k rows) - muito rápido
                    items = AlimentoMedidaIBGE.objects.select_related('medida').all()
                    cache = []
                    for item in items:
                        cache.append({
                            'nome_alimento': item.nome_alimento,
                            'nome_lower': item.nome_alimento.lower(),
                            'medida_nome': item.medida.nome,
                            'peso_g': item.peso_g
                        })
                    FoodSearchViewSet.IBGE_CACHE = cache
                    print(f"IBGE Cache loaded: {len(cache)} items")
                except Exception as e:
                    print(f"Error loading IBGE cache: {e}")

        def get_measure_data(food_name):
            """
            Retorna a melhor medida padrão e uma lista de todas as medidas disponíveis.
            Usa CACHE EM MEMÓRIA para performance extrema.
            """
            if not food_name: return None, None, []
            
            # Garante que o cache está carregado
            ensure_cache()
            
            # Limpeza do nome
            parts = food_name.split(',')
            clean_name = parts[0].strip()
            
            if len(parts) > 1 and len(clean_name.split()) == 1:
                potential_name = f"{clean_name} {parts[1].strip()}"
                if len(potential_name) < 30:
                    clean_name = potential_name
            
            search_term = clean_name.lower()

            # Busca no CACHE (em memória)
            # 1. Filtra matches
            matches = [m for m in FoodSearchViewSet.IBGE_CACHE if search_term in m['nome_lower']]
            
            # Excluir medidas triviais
            matches = [m for m in matches if m['medida_nome'] not in ['Grama', 'Quilo', 'Miligrama']]

            if not matches:
                first_word = clean_name.split()[0].lower()
                if len(first_word) > 3:
                    matches = [m for m in FoodSearchViewSet.IBGE_CACHE if first_word in m['nome_lower']]
                    matches = [m for m in matches if m['medida_nome'] not in ['Grama', 'Quilo', 'Miligrama']]

            available_measures = []
            if matches:
                # Coletar todas as medidas únicas
                seen_measures = set()
                for m in matches:
                    if m['medida_nome'] not in seen_measures:
                        available_measures.append({
                            'label': m['medida_nome'],
                            'weight': m['peso_g']
                        })
                        seen_measures.add(m['medida_nome'])

                # HEURÍSTICA PARA MEDIDA PADRÃO
                
                # Lista de prioridades baseada no tipo de alimento (tentativa por nome)
                priorities = []
                name_lower = search_term # já é lower
                
                # 1. Líquidos/Bebidas -> Mililitro, Copo, Xícara
                if any(x in name_lower for x in ['suco', 'agua', 'água', 'cafe', 'café', 'cha', 'chá', 'leite', 'bebida', 'vitamina', 'refrigerante', 'iogurte', 'yogurte', 'cerveja', 'vinho']):
                    priorities = ['Mililitro', 'Ml', 'Copo', 'Xícara', 'Caneca', 'Taça']
                
                # 2. Frutas/Legumes Inteiros -> Unidade, Fatia
                elif any(x in name_lower for x in ['laranja', 'maca', 'maçã', 'banana', 'mamao', 'mamão', 'melancia', 'melao', 'pao', 'pão', 'pera', 'pêra', 'tangerina', 'mexerica', 'kiwi', 'batata doce']):
                    priorities = ['Unidade', 'Fatia', 'Gomo', 'Pedaço']

                # 3. Bolos/Tortas/Doces -> Fatia, Pedaço
                elif any(x in name_lower for x in ['bolo', 'torta', 'pizza', 'pudim', 'chocolate']):
                    priorities = ['Fatia', 'Pedaço', 'Unidade', 'Barra']
                    
                # 4. Folhosos -> Prato, Folha
                elif any(x in name_lower for x in ['alface', 'rucula', 'rúcula', 'agriao', 'agrião', 'couve', 'espinafre', 'escarola', 'acelga']):
                    priorities = ['Prato', 'Folha', 'Pires']
                
                # 5. Grãos/Cozidos/Pastosos -> Colher, Concha
                else:
                    priorities = ['Colher de arroz', 'Colher de sopa', 'Concha', 'Escumadeira', 'Colher']

                # Tentar encontrar a melhor match baseada na prioridade
                best_match = None
                for priority in priorities:
                    # Tenta encontrar string que COMEÇA com a prioridade para ser mais específico
                    # Ex: 'Colher de arroz' deve vir antes de 'Colher' genérica
                    for m in available_measures:
                         if m['label'].lower().startswith(priority.lower()):
                             best_match = m
                             break
                    if best_match: break
                
                # Se não achou por prefixo, tenta contains
                if not best_match:
                    for priority in priorities:
                        for m in available_measures:
                             if priority.lower() in m['label'].lower():
                                 best_match = m
                                 break
                        if best_match: break

                # Fallback genérico se a heurística específica falhar
                if not best_match:
                     fallback_priorities = ['Unidade', 'Colher de sopa', 'Fatia', 'Copo']
                     for priority in fallback_priorities:
                        for m in available_measures:
                             if priority.lower() in m['label'].lower():
                                 best_match = m
                                 break
                        if best_match: break
                
                # Último recurso: pega o primeiro
                if not best_match and available_measures:
                    best_match = available_measures[0]

                if best_match:
                    return best_match['label'], best_match['weight'], available_measures

            return None, None, []

        def is_invalid_measure(name):
            return not name or name.lower() in ['g', 'grama', 'gramas', 'ml', 'mililitro', 'l', 'litro', 'mg']

        # Helper para busca multi-termo (AND logic) com Sinônimos (OR logic para o termo)
        def apply_search_filter(queryset, query, field='nome'):
            if not query: return queryset
            
            # Mapa de sinônimos para melhorar a experiência de busca
            SYNONYMS = {
                'file': ['filé', 'file', 'peito', 'bife', 'lombo', 'posta'],
                'filé': ['filé', 'file', 'peito', 'bife', 'lombo', 'posta'],
                'bife': ['bife', 'carne', 'patinho', 'alcatra', 'contra-filé', 'contra filé'],
                'suco': ['suco', 'néctar', 'polpa', 'refresco'],
                'pure': ['purê', 'pure', 'amassado'],
                'purê': ['purê', 'pure', 'amassado'],
                'macarrao': ['macarrão', 'macarrao', 'espaguete', 'massa'],
                'macarrão': ['macarrão', 'macarrao', 'espaguete', 'massa'],
                'pao': ['pão', 'pao', 'francês', 'forma'],
                'pão': ['pão', 'pao', 'francês', 'forma']
            }

            from django.db.models import Q
            
            terms = query.split()
            for term in terms:
                term_lower = term.lower()
                
                # Verifica se o termo tem sinônimos conhecidos
                if term_lower in SYNONYMS:
                    synonym_list = SYNONYMS[term_lower]
                    # Cria query OR: (campo__icontains=termo OR campo__icontains=sinonimo1 OR ...)
                    q_obj = Q(**{f'{field}__icontains': term})
                    for syn in synonym_list:
                        if syn != term_lower:
                            q_obj |= Q(**{f'{field}__icontains': syn})
                    queryset = queryset.filter(q_obj)
                else:
                    # Busca padrão exata para o termo
                    kwargs = {f'{field}__icontains': term}
                    queryset = queryset.filter(**kwargs)
                    
            return queryset

        # Limite de resultados por fonte para evitar sobrecarga e lentidão na busca de medidas
        MAX_RESULTS_PER_SOURCE = 100

        # Search TACO
        if not source_filter or source_filter == 'TACO':
            taco_qs = AlimentoTACO.objects.all()
            taco_qs = apply_search_filter(taco_qs, search_query)
            if grupo_filter:
                taco_qs = taco_qs.filter(grupo__icontains=grupo_filter)
            
            # Prioritize Favorites: Fetch them regardless of limit
            taco_fav_ids = [int(k.split('_')[1]) for k in user_fav_keys if k.startswith('TACO_')]
            taco_favorites = taco_qs.filter(id__in=taco_fav_ids)
            taco_others = taco_qs.exclude(id__in=taco_fav_ids)[:MAX_RESULTS_PER_SOURCE]
            
            taco_qs = list(chain(taco_favorites, taco_others))
            
            for item in taco_qs:
                uc, peso_uc = item.unidade_caseira, item.peso_unidade_caseira_g
                measures_list = []
                
                # Sempre buscar medidas alternativas no IBGE para dar opções ao usuário
                target_name = item.nome
                mc_nome, mc_peso, mc_list = get_measure_data(target_name)
                
                if mc_list:
                    measures_list = mc_list

                # Se a medida original for ruim, sobrescreve com a melhor do IBGE
                if is_invalid_measure(uc) or not peso_uc:
                    if mc_nome:
                        uc, peso_uc = mc_nome, mc_peso
                else:
                    # Se a original for boa, adiciona ela na lista de opções também
                     measures_list.insert(0, {'label': uc, 'weight': peso_uc})

                is_fav = f"TACO_{item.id}" in user_fav_keys

                results.append({
                    'id': item.id,
                    'nome': item.nome,
                    'grupo': item.grupo,
                    'source': 'TACO',
                    'is_favorite': is_fav,
                    'energia_kcal': item.energia_kcal,
                    'proteina_g': item.proteina_g,
                    'lipidios_g': item.lipidios_g,
                    'carboidrato_g': item.carboidrato_g,
                    'fibra_g': item.fibra_g,
                    'unidade_caseira': uc,
                    'peso_unidade_caseira_g': peso_uc,
                    'medidas': measures_list # Nova lista de opções
                })

        # Search TBCA
        if not source_filter or source_filter == 'TBCA':
            tbca_qs = AlimentoTBCA.objects.all()
            tbca_qs = apply_search_filter(tbca_qs, search_query)
            if grupo_filter:
                tbca_qs = tbca_qs.filter(grupo__icontains=grupo_filter)
            
            # Prioritize Favorites
            tbca_fav_ids = [int(k.split('_')[1]) for k in user_fav_keys if k.startswith('TBCA_')]
            tbca_favorites = tbca_qs.filter(id__in=tbca_fav_ids)
            tbca_others = tbca_qs.exclude(id__in=tbca_fav_ids)[:MAX_RESULTS_PER_SOURCE]
            
            tbca_qs = list(chain(tbca_favorites, tbca_others))
            
            for item in tbca_qs:
                uc, peso_uc = item.unidade_caseira, item.peso_unidade_caseira_g
                measures_list = []
                
                mc_nome, mc_peso, mc_list = get_measure_data(item.nome)
                if mc_list: measures_list = mc_list

                if is_invalid_measure(uc) or not peso_uc:
                    if mc_nome:
                        uc, peso_uc = mc_nome, mc_peso
                else:
                     measures_list.insert(0, {'label': uc, 'weight': peso_uc})
                
                is_fav = f"TBCA_{item.id}" in user_fav_keys

                results.append({
                    'id': item.id,
                    'nome': item.nome,
                    'grupo': item.grupo,
                    'source': 'TBCA',
                    'is_favorite': is_fav,
                    'energia_kcal': item.energia_kcal,
                    'proteina_g': item.proteina_g,
                    'lipidios_g': item.lipidios_g,
                    'carboidrato_g': item.carboidrato_g,
                    'fibra_g': item.fibra_g,
                    'unidade_caseira': uc,
                    'peso_unidade_caseira_g': peso_uc,
                    'medidas': measures_list
                })

        # Search USDA
        if not source_filter or source_filter == 'USDA':
            usda_qs = AlimentoUSDA.objects.all()
            usda_qs = apply_search_filter(usda_qs, search_query)
            if grupo_filter:
                usda_qs = usda_qs.filter(categoria__icontains=grupo_filter)
            
            # Prioritize Favorites
            usda_fav_ids = [int(k.split('_')[1]) for k in user_fav_keys if k.startswith('USDA_')]
            usda_favorites = usda_qs.filter(id__in=usda_fav_ids)
            usda_others = usda_qs.exclude(id__in=usda_fav_ids)[:MAX_RESULTS_PER_SOURCE]
            
            usda_qs = list(chain(usda_favorites, usda_others))
            
            for item in usda_qs:
                uc, peso_uc = None, item.porcao_padrao_g
                measures_list = []
                
                mc_nome, mc_peso, mc_list = get_measure_data(item.nome)
                if mc_list: measures_list = mc_list
                if mc_nome: uc, peso_uc = mc_nome, mc_peso
                
                if item.porcao_padrao_descricao and item.porcao_padrao_g:
                     measures_list.insert(0, {'label': item.porcao_padrao_descricao, 'weight': item.porcao_padrao_g})

                is_fav = f"USDA_{item.id}" in user_fav_keys

                results.append({
                    'id': item.id,
                    'nome': item.nome,
                    'grupo': item.categoria,
                    'source': 'USDA',
                    'is_favorite': is_fav,
                    'energia_kcal': item.energia_kcal,
                    'proteina_g': item.proteina_g,
                    'lipidios_g': item.lipidios_g,
                    'carboidrato_g': item.carboidrato_g,
                    'fibra_g': item.fibra_g,
                    'unidade_caseira': uc,
                    'peso_unidade_caseira_g': peso_uc,
                    'medidas': measures_list
                })

        # Search IBGE (Tabela de Medidas - Sem informação nutricional)
        if not source_filter or source_filter == 'IBGE':
            # Buscar na tabela de medidas distinct por nome para evitar duplicatas excessivas
            # Como a tabela de medidas tem múltiplas entradas por alimento (1 pra cada medida), 
            # precisamos agrupar.
            ibge_qs = AlimentoMedidaIBGE.objects.filter(nome_alimento__icontains=search_query)\
                                                .values('nome_alimento')\
                                                .distinct().order_by('nome_alimento')

            # Prioritize Favorites
            ibge_favorites = ibge_qs.filter(nome_alimento__in=ibge_fav_names)
            ibge_others = ibge_qs.exclude(nome_alimento__in=ibge_fav_names)[:MAX_RESULTS_PER_SOURCE]
            
            ibge_qs = list(chain(ibge_favorites, ibge_others))
            
            for item in ibge_qs:
                name = item['nome_alimento']
                # Obter medidas para este alimento
                mc_nome, mc_peso, mc_list = get_measure_data(name)
                
                # Tentar encontrar dados nutricionais na TBCA (Melhor esforço)
                # Como IBGE POF 2017 usa TBCA, os nomes são muito similares
                nutri_data = {
                    'energia_kcal': 0,
                    'proteina_g': 0,
                    'lipidios_g': 0,
                    'carboidrato_g': 0,
                    'fibra_g': 0
                }
                
                # Tenta match exato ou parcial relevante
                # Otimização: Buscamos apenas 1 match para não pesar
                tbca_match = AlimentoTBCA.objects.filter(nome__icontains=name).first()
                
                if not tbca_match:
                    # Tentar match reverso (se nome IBGE for mais longo que TBCA)
                    # ex: "Arroz tipo 1 cozido" vs "Arroz cozido"
                    simplified_name = name.split(',')[0]
                    if len(simplified_name) > 3:
                         tbca_match = AlimentoTBCA.objects.filter(nome__icontains=simplified_name).first()

                if tbca_match:
                    nutri_data['energia_kcal'] = tbca_match.energia_kcal
                    nutri_data['proteina_g'] = tbca_match.proteina_g
                    nutri_data['lipidios_g'] = tbca_match.lipidios_g
                    nutri_data['carboidrato_g'] = tbca_match.carboidrato_g
                    nutri_data['fibra_g'] = tbca_match.fibra_g

                # Para IBGE usamos MD5(name) para garantir ID ESTÁVEL e ÚNICO entre requests
                # hash() do Python é randomizado por processo e causa duplicatas na paginação
                fake_id = hashlib.md5(name.encode('utf-8')).hexdigest()
                is_fav = f"IBGE_{fake_id}" in user_fav_keys

                results.append({
                    'id': fake_id,
                    'nome': name,
                    'grupo': 'Medida Caseira (IBGE)',
                    'source': 'IBGE',
                    'is_favorite': is_fav,
                    'energia_kcal': nutri_data['energia_kcal'],
                    'proteina_g': nutri_data['proteina_g'],
                    'lipidios_g': nutri_data['lipidios_g'],
                    'carboidrato_g': nutri_data['carboidrato_g'],
                    'fibra_g': nutri_data['fibra_g'],
                    'unidade_caseira': mc_nome,
                    'peso_unidade_caseira_g': mc_peso,
                    'medidas': mc_list
                })

        # Sort all results: Favorites first, then alphabetical (case insensitive)
        # x.get('is_favorite', False) is True for favorites.
        # We want True first. Python sorts False (0) then True (1). So we want descending on is_favorite (bools as ints).
        # Actually (not True) is 0 (first), (not False) is 1 (last).
        results.sort(key=lambda x: (not x.get('is_favorite', False), x['nome'].lower()))

        # Limitar resultados totais para evitar sobrecarga (Aumentado para 1000)
        # Importante fazer isso DEPOIS do sort para não cortar favoritos que estariam no final da lista bruta
        if len(results) > 1000:
            results = results[:1000]
            
        print(f"DEBUG SEARCH: Total {len(results)}, Favs {sum(1 for x in results if x.get('is_favorite'))}")

        # Paginate the results
        paginator = FoodPageNumberPagination()
        paginated_results = paginator.paginate_queryset(results, request, view=self)

        return paginator.get_paginated_response(paginated_results)
    
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
