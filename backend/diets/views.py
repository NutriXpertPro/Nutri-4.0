from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination  # Importado
from django.db.models import Q
from itertools import chain
import hashlib

from .models import (
    AlimentoTACO,
    AlimentoTBCA,
    AlimentoUSDA,
    Diet,
    Meal,
    FoodItem,
    AlimentoMedidaIBGE,
    MedidaCaseira,
    FavoriteFood,
    MealPreset,
    DefaultPreset,
    FoodSubstitutionGroup,
    FoodSubstitution,
    FoodSubstitutionRule,
    NutritionistSubstitutionFavorite,
)
from .serializers import (
    AlimentoTACOSerializer,
    AlimentoTBCASerializer,
    AlimentoUSDASerializer,
    UnifiedFoodSerializer,
    DietSerializer,
    MealSerializer,
    FoodItemSerializer,
    MealPresetSerializer,
    DefaultPresetSerializer,
    FoodSubstitutionGroupSerializer,
    FoodSubstitutionRuleSerializer,
    NutritionistSubstitutionFavoriteSerializer,
)
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser


class ToggleFavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        food_source = data.get("source")
        food_id = str(data.get("id"))
        food_name = data.get("nome")

        if not all([food_source, food_id]):
            return Response(
                {"error": "Dados incompletos"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Tentar encontrar
        favorite = FavoriteFood.objects.filter(
            user=user, food_source=food_source, food_id=food_id
        ).first()

        if favorite:
            favorite.delete()
            return Response({"is_favorite": False})
        else:
            FavoriteFood.objects.create(
                user=user,
                food_source=food_source,
                food_id=food_id,
                food_name=food_name or "Alimento",
            )
            return Response({"is_favorite": True})


class FoodPageNumberPagination(PageNumberPagination):
    page_size = 20  # Reduzido para melhor desempenho
    page_size_query_param = "page_size"
    max_page_size = 100  # Reduzido para evitar abusos e sobrecarga


class FoodSearchViewSet(viewsets.ViewSet):
    """
    ViewSet para busca unificada de alimentos em todas as tabelas (TACO, TBCA, USDA).
    """

    permission_classes = [IsAuthenticated]

    @classmethod
    def ensure_cache(cls):
        """Cache global para evitar N+1 queries no IBGE com dados nutricionais"""
        if not hasattr(cls, "IBGE_CACHE") or not cls.IBGE_CACHE:
            try:
                # Carrega medidas IBGE
                items = AlimentoMedidaIBGE.objects.select_related("medida").all()

                # Para dados nutricionais no IBGE, fazemos match com TBCA
                tbca_lookup = {
                    item.nome.lower(): item
                    for item in AlimentoTBCA.objects.all().only(
                        "nome",
                        "energia_kcal",
                        "proteina_g",
                        "lipidios_g",
                        "carboidrato_g",
                        "fibra_g",
                    )
                }

                cache = {}
                for item in items:
                    name = item.nome_alimento
                    md5_id = hashlib.md5(name.encode("utf-8")).hexdigest()
                    if md5_id not in cache:
                        name_lower = name.lower()
                        nutri = tbca_lookup.get(name_lower)
                        if not nutri:
                            simplified = name_lower.split(",")[0]
                            nutri = tbca_lookup.get(simplified)

                        cache[md5_id] = {
                            "id": md5_id,  # Adicionado ID explícito
                            "nome": name,
                            "nome_lower": name_lower,
                            "medida_nome": item.medida.nome,
                            "peso_g": item.peso_g,
                            "energia_kcal": nutri.energia_kcal if nutri else 0,
                            "proteina_g": nutri.proteina_g if nutri else 0,
                            "lipidios_g": nutri.lipidios_g if nutri else 0,
                            "carboidrato_g": nutri.carboidrato_g if nutri else 0,
                            "fibra_g": nutri.fibra_g if nutri else 0,
                            "grupo": "Medida Caseira (IBGE)",
                        }
                cls.IBGE_CACHE = cache
                print(f"IBGE Cache loaded with nutrition: {len(cache)} items")
            except Exception as e:
                print(f"Error loading IBGE cache: {e}")

    def list(self, request):
        """
        GET /api/v1/foods/?search=arroz&source=TACO&limit=50
        Busca alimentos em todas as tabelas ou em uma específica.
        """
        search_query = request.query_params.get("search", "").strip()
        source_filter = request.query_params.get("source", "").upper()
        grupo_filter = request.query_params.get("grupo", "")

        if len(search_query) < 2:
            return Response(
                {"error": "A busca deve ter pelo menos 2 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Proteção contra buscas excessivamente amplas (aumentado para 150 para descrições longas)
        if len(search_query) > 150:
            return Response(
                {"error": "A busca é muito longa. Máximo de 150 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mapa de favoritos do usuário para lookup O(1)
        user_fav_keys = set()
        ibge_fav_names = set()
        if request.user.is_authenticated:
            favs = FavoriteFood.objects.filter(user=request.user)
            for f in favs:
                user_fav_keys.add(f"{f.food_source}_{f.food_id}")
                if f.food_source == "IBGE":
                    ibge_fav_names.add(f.food_name)

        results = []
        self.ensure_cache()

        def get_measure_data(food_name):
            """
            Retorna a melhor medida padrão e uma lista de todas as medidas disponíveis.
            Usa CACHE EM MEMÓRIA para performance extrema.
            """
            if not food_name:
                return None, None, []

            # Garante que o cache está carregado
            self.ensure_cache()

            # Limpeza do nome
            parts = food_name.split(",")
            clean_name = parts[0].strip()

            if len(parts) > 1 and len(clean_name.split()) == 1:
                potential_name = f"{clean_name} {parts[1].strip()}"
                if len(potential_name) < 30:
                    clean_name = potential_name

            search_term = clean_name.lower()

            # Busca no CACHE (em memória)
            # 1. Filtra matches
            matches = [
                m
                for m in FoodSearchViewSet.IBGE_CACHE.values()
                if search_term in m["nome_lower"]
            ]

            # Excluir medidas triviais
            matches = [
                m
                for m in matches
                if m["medida_nome"] not in ["Grama", "Quilo", "Miligrama"]
            ]

            if not matches:
                first_word = clean_name.split()[0].lower()
                if len(first_word) > 3:
                    matches = [
                        m
                        for m in FoodSearchViewSet.IBGE_CACHE.values()
                        if first_word in m["nome_lower"]
                    ]
                    matches = [
                        m
                        for m in matches
                        if m["medida_nome"] not in ["Grama", "Quilo", "Miligrama"]
                    ]

            available_measures = []
            if matches:
                # Coletar todas as medidas únicas
                seen_measures = set()
                for m in matches:
                    if m["medida_nome"] not in seen_measures:
                        available_measures.append(
                            {"label": m["medida_nome"], "weight": m["peso_g"]}
                        )
                        seen_measures.add(m["medida_nome"])

                # HEURÍSTICA PARA MEDIDA PADRÃO

                # Lista de prioridades baseada no tipo de alimento (tentativa por nome)
                priorities = []
                name_lower = search_term  # já é lower

                # 1. Líquidos/Bebidas -> Mililitro, Copo, Xícara
                if any(
                    x in name_lower
                    for x in [
                        "suco",
                        "agua",
                        "água",
                        "cafe",
                        "café",
                        "cha",
                        "chá",
                        "leite",
                        "bebida",
                        "vitamina",
                        "refrigerante",
                        "iogurte",
                        "yogurte",
                        "cerveja",
                        "vinho",
                    ]
                ):
                    priorities = ["Mililitro", "Ml", "Copo", "Xícara", "Caneca", "Taça"]

                # 2. Frutas/Legumes Inteiros -> Unidade, Fatia
                elif any(
                    x in name_lower
                    for x in [
                        "laranja",
                        "maca",
                        "maçã",
                        "banana",
                        "mamao",
                        "mamão",
                        "melancia",
                        "melao",
                        "pao",
                        "pão",
                        "pera",
                        "pêra",
                        "tangerina",
                        "mexerica",
                        "kiwi",
                        "batata doce",
                    ]
                ):
                    priorities = ["Unidade", "Fatia", "Gomo", "Pedaço"]

                # 3. Bolos/Tortas/Doces -> Fatia, Pedaço
                elif any(
                    x in name_lower
                    for x in ["bolo", "torta", "pizza", "pudim", "chocolate"]
                ):
                    priorities = ["Fatia", "Pedaço", "Unidade", "Barra"]

                # 4. Folhosos -> Prato, Folha
                elif any(
                    x in name_lower
                    for x in [
                        "alface",
                        "rucula",
                        "rúcula",
                        "agriao",
                        "agrião",
                        "couve",
                        "espinafre",
                        "escarola",
                        "acelga",
                    ]
                ):
                    priorities = ["Prato", "Folha", "Pires"]

                # 5. Grãos/Cozidos/Pastosos -> Colher, Concha
                else:
                    priorities = [
                        "Colher de arroz",
                        "Colher de sopa",
                        "Concha",
                        "Escumadeira",
                        "Colher",
                    ]

                # Tentar encontrar a melhor match baseada na prioridade
                best_match = None
                for priority in priorities:
                    # Tenta encontrar string que COMEÇA com a prioridade para ser mais específico
                    # Ex: 'Colher de arroz' deve vir antes de 'Colher' genérica
                    for m in available_measures:
                        if m["label"].lower().startswith(priority.lower()):
                            best_match = m
                            break
                    if best_match:
                        break

                # Se não achou por prefixo, tenta contains
                if not best_match:
                    for priority in priorities:
                        for m in available_measures:
                            if priority.lower() in m["label"].lower():
                                best_match = m
                                break
                        if best_match:
                            break

                # Fallback genérico se a heurística específica falhar
                if not best_match:
                    fallback_priorities = ["Unidade", "Colher de sopa", "Fatia", "Copo"]
                    for priority in fallback_priorities:
                        for m in available_measures:
                            if priority.lower() in m["label"].lower():
                                best_match = m
                                break
                        if best_match:
                            break

                # Último recurso: pega o primeiro
                if not best_match and available_measures:
                    best_match = available_measures[0]

                if best_match:
                    return best_match["label"], best_match["weight"], available_measures

            return None, None, []

        def is_invalid_measure(name):
            return not name or name.lower() in [
                "g",
                "grama",
                "gramas",
                "ml",
                "mililitro",
                "l",
                "litro",
                "mg",
            ]

        # Helper para busca multi-termo (AND logic) com Sinônimos (OR logic para o termo)
        def apply_search_filter(queryset, query, field="nome"):
            if not query:
                return queryset

            # Mapa de sinônimos para melhorar a experiência de busca
            SYNONYMS = {
                "file": ["filé", "file", "peito", "bife", "lombo", "posta"],
                "filé": ["filé", "file", "peito", "bife", "lombo", "posta"],
                "bife": [
                    "bife",
                    "carne",
                    "patinho",
                    "alcatra",
                    "contra-filé",
                    "contra filé",
                ],
                "suco": ["suco", "néctar", "polpa", "refresco"],
                "pure": ["purê", "pure", "amassado"],
                "purê": ["purê", "pure", "amassado"],
                "macarrao": ["macarrão", "macarrao", "espaguete", "massa"],
                "macarrão": ["macarrão", "macarrao", "espaguete", "massa"],
                "pao": ["pão", "pao", "francês", "forma"],
                "pão": ["pão", "pao", "francês", "forma"],
            }

            from django.db.models import Q

            terms = query.split()
            for term in terms:
                term_lower = term.lower()

                # Verifica se o termo tem sinônimos conhecidos
                if term_lower in SYNONYMS:
                    synonym_list = SYNONYMS[term_lower]
                    # Cria query OR: (campo__icontains=termo OR campo__icontains=sinonimo1 OR ...)
                    q_obj = Q(**{f"{field}__icontains": term})
                    for syn in synonym_list:
                        if syn != term_lower:
                            q_obj |= Q(**{f"{field}__icontains": syn})
                    queryset = queryset.filter(q_obj)
                else:
                    # Busca padrão exata para o termo
                    kwargs = {f"{field}__icontains": term}
                    queryset = queryset.filter(**kwargs)

            return queryset

        # Limite de resultados por fonte para evitar sobrecarga e lentidão na busca de medidas
        MAX_RESULTS_PER_SOURCE = 500

        # Search TACO
        if not source_filter or source_filter == "TACO":
            taco_qs = AlimentoTACO.objects.all()
            taco_qs = apply_search_filter(taco_qs, search_query)
            if grupo_filter:
                taco_qs = taco_qs.filter(grupo__icontains=grupo_filter)

            # Prioritize Favorites: Fetch them regardless of limit
            taco_fav_ids = [
                int(k.split("_")[1]) for k in user_fav_keys if k.startswith("TACO_")
            ]
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
                    measures_list.insert(0, {"label": uc, "weight": peso_uc})

                is_fav = f"TACO_{item.id}" in user_fav_keys

                results.append(
                    {
                        "id": item.id,
                        "nome": item.nome,
                        "grupo": item.grupo,
                        "source": "TACO",
                        "is_favorite": is_fav,
                        "energia_kcal": item.energia_kcal,
                        "proteina_g": item.proteina_g,
                        "lipidios_g": item.lipidios_g,
                        "carboidrato_g": item.carboidrato_g,
                        "fibra_g": item.fibra_g,
                        "unidade_caseira": uc,
                        "peso_unidade_caseira_g": peso_uc,
                        "medidas": measures_list,  # Nova lista de opções
                    }
                )

        # Search TBCA
        if not source_filter or source_filter == "TBCA":
            tbca_qs = AlimentoTBCA.objects.all()
            tbca_qs = apply_search_filter(tbca_qs, search_query)
            if grupo_filter:
                tbca_qs = tbca_qs.filter(grupo__icontains=grupo_filter)

            # Prioritize Favorites
            tbca_fav_ids = [
                int(k.split("_")[1]) for k in user_fav_keys if k.startswith("TBCA_")
            ]
            tbca_favorites = tbca_qs.filter(id__in=tbca_fav_ids)
            tbca_others = tbca_qs.exclude(id__in=tbca_fav_ids)[:MAX_RESULTS_PER_SOURCE]

            tbca_qs = list(chain(tbca_favorites, tbca_others))

            for item in tbca_qs:
                uc, peso_uc = item.unidade_caseira, item.peso_unidade_caseira_g
                measures_list = []

                mc_nome, mc_peso, mc_list = get_measure_data(item.nome)
                if mc_list:
                    measures_list = mc_list

                if is_invalid_measure(uc) or not peso_uc:
                    if mc_nome:
                        uc, peso_uc = mc_nome, mc_peso
                else:
                    measures_list.insert(0, {"label": uc, "weight": peso_uc})

                is_fav = f"TBCA_{item.id}" in user_fav_keys

                results.append(
                    {
                        "id": item.id,
                        "nome": item.nome,
                        "grupo": item.grupo,
                        "source": "TBCA",
                        "is_favorite": is_fav,
                        "energia_kcal": item.energia_kcal,
                        "proteina_g": item.proteina_g,
                        "lipidios_g": item.lipidios_g,
                        "carboidrato_g": item.carboidrato_g,
                        "fibra_g": item.fibra_g,
                        "unidade_caseira": uc,
                        "peso_unidade_caseira_g": peso_uc,
                        "medidas": measures_list,
                    }
                )

        # Search USDA
        if not source_filter or source_filter == "USDA":
            usda_qs = AlimentoUSDA.objects.all()
            usda_qs = apply_search_filter(usda_qs, search_query)
            if grupo_filter:
                usda_qs = usda_qs.filter(categoria__icontains=grupo_filter)

            # Prioritize Favorites
            usda_fav_ids = [
                int(k.split("_")[1]) for k in user_fav_keys if k.startswith("USDA_")
            ]
            usda_favorites = usda_qs.filter(id__in=usda_fav_ids)
            usda_others = usda_qs.exclude(id__in=usda_fav_ids)[:MAX_RESULTS_PER_SOURCE]

            usda_qs = list(chain(usda_favorites, usda_others))

            for item in usda_qs:
                uc, peso_uc = None, item.porcao_padrao_g
                measures_list = []

                mc_nome, mc_peso, mc_list = get_measure_data(item.nome)
                if mc_list:
                    measures_list = mc_list
                if mc_nome:
                    uc, peso_uc = mc_nome, mc_peso

                # USDA doesn't have porcao_padrao_descricao, it only has porcao_padrao_g
                # so we don't need to insert a custom measure here as 100g is implied or handled by IBGE lookup

                is_fav = f"USDA_{item.id}" in user_fav_keys

                results.append(
                    {
                        "id": item.id,
                        "nome": item.nome,
                        "grupo": item.categoria,
                        "source": "USDA",
                        "is_favorite": is_fav,
                        "energia_kcal": item.energia_kcal,
                        "proteina_g": item.proteina_g,
                        "lipidios_g": item.lipidios_g,
                        "carboidrato_g": item.carboidrato_g,
                        "fibra_g": item.fibra_g,
                        "unidade_caseira": uc,
                        "peso_unidade_caseira_g": peso_uc,
                        "medidas": measures_list,
                    }
                )

        # Search IBGE (Tabela de Medidas - Sem informação nutricional)
        # REMOVIDO DOS RESULTADOS DE BUSCA PARA EVITAR USO NA CRIAÇÃO DE DIETAS
        # pois não contém dados nutricionais completos
        # if not source_filter or source_filter == "IBGE":
        #     # Buscar na tabela de medidas distinct por nome para evitar duplicatas excessivas
        #     # Como a tabela de medidas tem múltiplas entradas por alimento (1 pra cada medida),
        #     # precisamos agrupar.
        #     ibge_qs = (
        #         AlimentoMedidaIBGE.objects.filter(nome_alimento__icontains=search_query)
        #         .values("nome_alimento")
        #         .distinct()
        #         .order_by("nome_alimento")
        #     )
        #
        #     # Prioritize Favorites
        #     ibge_favorites = ibge_qs.filter(nome_alimento__in=ibge_fav_names)
        #     ibge_others = ibge_qs.exclude(nome_alimento__in=ibge_fav_names)[
        #         :MAX_RESULTS_PER_SOURCE
        #     ]
        #
        #     ibge_qs = list(chain(ibge_favorites, ibge_others))
        #
        #     for item in ibge_qs:
        #         name = item["nome_alimento"]
        #         # Obter medidas para este alimento
        #         mc_nome, mc_peso, mc_list = get_measure_data(name)
        #
        #         # Tentar encontrar dados nutricionais na TBCA (Melhor esforço)
        #         # Como IBGE POF 2017 usa TBCA, os nomes são muito similares
        #         nutri_data = {
        #             "energia_kcal": 0,
        #             "proteina_g": 0,
        #             "lipidios_g": 0,
        #             "carboidrato_g": 0,
        #             "fibra_g": 0,
        #         }
        #
        #         # Tenta match exato ou parcial relevante
        #         # Otimização: Buscamos apenas 1 match para não pesar
        #         tbca_match = AlimentoTBCA.objects.filter(nome__icontains=name).first()
        #
        #         if not tbca_match:
        #             # Tentar match reverso (se nome IBGE for mais longo que TBCA)
        #             # ex: "Arroz tipo 1 cozido" vs "Arroz cozido"
        #             simplified_name = name.split(",")[0]
        #             if len(simplified_name) > 3:
        #                 tbca_match = AlimentoTBCA.objects.filter(
        #                     nome__icontains=simplified_name
        #                 ).first()
        #
        #         if tbca_match:
        #             nutri_data["energia_kcal"] = tbca_match.energia_kcal
        #             nutri_data["proteina_g"] = tbca_match.proteina_g
        #             nutri_data["lipidios_g"] = tbca_match.lipidios_g
        #             nutri_data["carboidrato_g"] = tbca_match.carboidrato_g
        #             nutri_data["fibra_g"] = tbca_match.fibra_g
        #
        #         # Para IBGE usamos MD5(name) para garantir ID ESTÁVEL e ÚNICO entre requests
        #         # hash() do Python é randomizado por processo e causa duplicatas na paginação
        #         fake_id = hashlib.md5(name.encode("utf-8")).hexdigest()
        #         is_fav = f"IBGE_{fake_id}" in user_fav_keys
        #
        #         results.append(
        #             {
        #                 "id": fake_id,
        #                 "nome": name,
        #                 "grupo": "Medida Caseira (IBGE)",
        #                 "source": "IBGE",
        #                 "is_favorite": is_fav,
        #                 "energia_kcal": nutri_data["energia_kcal"],
        #                 "proteina_g": nutri_data["proteina_g"],
        #                 "lipidios_g": nutri_data["lipidios_g"],
        #                 "carboidrato_g": nutri_data["carboidrato_g"],
        #                 "fibra_g": nutri_data["fibra_g"],
        #                 "unidade_caseira": mc_nome,
        #                 "peso_unidade_caseira_g": mc_peso,
        #                 "medidas": mc_list,
        #             }
        #         )

        # Sort all results: Favorites first, then by relevance and simplicity
        # Relevance: items that start with the search term come first, then items that contain it
        # Simplicity: fewer words and shorter names come first
        def sort_key(x):
            is_favorite = x.get("is_favorite", False)
            nome_lower = x["nome"].lower()

            # Check if the name starts with the search query
            starts_with = (
                nome_lower.startswith(search_query.lower()) if search_query else False
            )

            # Count words in the name
            import re

            words = re.split(r"[\s\-_,]+", nome_lower)
            word_count = len([w for w in words if w])  # Count non-empty words
            nome_length = len(nome_lower)

            # Return tuple for sorting:
            # 1. Not favorite first (so favorites come first)
            # 2. Not starts_with (so items that start with query come first)
            # 3. Word count (simpler names first)
            # 4. Name length (shorter names first)
            # 5. Alphabetical order
            return (
                not is_favorite,
                not starts_with,
                word_count,
                nome_length,
                nome_lower,
            )

        results.sort(key=sort_key)

        # Limitar resultados totais para evitar sobrecarga (Aumentado para 1000)
        # Importante fazer isso DEPOIS do sort para não cortar favoritos que estariam no final da lista bruta
        if len(results) > 1000:
            results = results[:1000]

        print(
            f"DEBUG SEARCH: Total {len(results)}, Favs {sum(1 for x in results if x.get('is_favorite'))}"
        )

        # Paginate the results
        paginator = FoodPageNumberPagination()
        paginated_results = paginator.paginate_queryset(results, request, view=self)

        return paginator.get_paginated_response(paginated_results)

    @action(detail=False, methods=["GET"])
    def grupos(self, request):
        """
        GET /api/v1/foods/grupos/
        Retorna todos os grupos/categorias disponíveis.
        """
        taco_grupos = set(
            AlimentoTACO.objects.values_list("grupo", flat=True).distinct()
        )
        tbca_grupos = set(
            AlimentoTBCA.objects.values_list("grupo", flat=True).distinct()
        )
        usda_grupos = set(
            AlimentoUSDA.objects.values_list("categoria", flat=True).distinct()
        )

        all_grupos = sorted(taco_grupos | tbca_grupos | usda_grupos)

        return Response({"grupos": all_grupos})

    @action(detail=False, methods=["GET"])
    def favorites(self, request):
        """
        GET /api/v1/diets/foods/favorites/
        Retorna a lista de alimentos favoritos do usuário com dados nutricionais completos.
        """
        if not request.user.is_authenticated:
            return Response({"results": []})

        # Garantir cache carregado (especialmente para IBGE)
        self.ensure_cache()

        favorites = FavoriteFood.objects.filter(user=request.user).order_by(
            "-created_at"
        )
        results = []

        for fav in favorites:
            food_data = self._get_food_data(fav.food_source, fav.food_id)
            if food_data:
                food_data["is_favorite"] = True
                results.append(food_data)

        return Response({"results": results})

    def _get_food_data(self, source, food_id):
        """Busca dados de um alimento específico em qualquer uma das fontes."""
        try:
            if source == "TACO":
                food = AlimentoTACO.objects.get(codigo=food_id)
                return {
                    "id": food.codigo,
                    "nome": food.nome,
                    "energia_kcal": food.energia_kcal,
                    "proteina_g": food.proteina_g,
                    "lipidios_g": food.lipidios_g,
                    "carboidrato_g": food.carboidrato_g,
                    "fibra_g": food.fibra_g,
                    "grupo": food.grupo,
                    "source": "TACO",
                }
            elif source == "TBCA":
                food = AlimentoTBCA.objects.get(codigo=food_id)
                return {
                    "id": food.codigo,
                    "nome": food.nome,
                    "energia_kcal": food.energia_kcal,
                    "proteina_g": food.proteina_g,
                    "lipidios_g": food.lipidios_g,
                    "carboidrato_g": food.carboidrato_g,
                    "fibra_g": food.fibra_g,
                    "grupo": food.grupo,
                    "source": "TBCA",
                }
            elif source == "USDA":
                food = AlimentoUSDA.objects.get(fdc_id=food_id)
                return {
                    "id": food.fdc_id,
                    "nome": food.nome,
                    "energia_kcal": food.energia_kcal,
                    "proteina_g": food.proteina_g,
                    "lipidios_g": food.lipidios_g,
                    "carboidrato_g": food.carboidrato_g,
                    "fibra_g": food.fibra_g,
                    "grupo": food.categoria,
                    "source": "USDA",
                }
            elif source == "IBGE":
                # Para IBGE, os dados completos vêm do cache
                # Acessa o cache da classe diretamente
                cache = getattr(FoodSearchViewSet, "IBGE_CACHE", {})
                if food_id in cache:
                    data = cache[food_id]
                    return {
                        "id": food_id,
                        "nome": data["nome"],
                        "energia_kcal": data["energia_kcal"],
                        "proteina_g": data["proteina_g"],
                        "lipidios_g": data["lipidios_g"],
                        "carboidrato_g": data["carboidrato_g"],
                        "fibra_g": data.get("fibra_g", 0),
                        "grupo": data.get("grupo", "IBGE"),
                        "source": "IBGE",
                    }
        except Exception:
            pass
        return None

    @action(detail=False, methods=["POST"])
    def calculate_substitution(self, request):
        """
        POST /api/v1/foods/calculate_substitution/
        Calcula substituição ideal entre dois alimentos do mesmo grupo nutricional.

        Body:
        {
            "original_food": {
                "nome": "arroz, integral, cozido",
                "energia_kcal": 124,
                "proteina_g": 2.6,
                "lipidios_g": 0.9,
                "carboidrato_g": 25.8,
                "fibra_g": 1.8
            },
            "substitute_food": {
                "nome": "batata, doce, cozida",
                "energia_kcal": 77,
                "proteina_g": 1.4,
                "lipidios_g": 0.1,
                "carboidrato_g": 17.9,
                "fibra_g": 2.5
            },
            "quantity_original_g": 100
        }

        Response:
        {
            "original": "arroz, integral, cozido 100g (124.0 kcal)",
            "substitute": "batata, doce, cozida 144.1g (111.0 kcal)",
            "group": "carboidratos_complexos",
            "macro_equalized": "carboidrato",
            "calorie_difference": 13.0,
            "calories_per_100g_original": 124,
            "calories_per_100g_substitute": 77
        }
        """
        from .nutritional_substitution import (
            calcular_substituicao,
            identificar_grupo_nutricional,
            NutricaoAlimento,
        )

        original_data = request.data.get("original_food")
        substitute_data = request.data.get("substitute_food")
        quantity_original = float(request.data.get("quantity_original_g", 100))

        if not original_data or not substitute_data:
            return Response(
                {"error": "original_food e substitute_food são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            alimento_original = NutricaoAlimento(
                nome=original_data.get("nome", ""),
                energia_kcal=float(original_data.get("energia_kcal", 0)),
                proteina_g=float(original_data.get("proteina_g", 0)),
                lipidios_g=float(original_data.get("lipidios_g", 0)),
                carboidrato_g=float(original_data.get("carboidrato_g", 0)),
                fibra_g=float(original_data.get("fibra_g", 0)),
            )

            alimento_substituto = NutricaoAlimento(
                nome=substitute_data.get("nome", ""),
                energia_kcal=float(substitute_data.get("energia_kcal", 0)),
                proteina_g=float(substitute_data.get("proteina_g", 0)),
                lipidios_g=float(substitute_data.get("lipidios_g", 0)),
                carboidrato_g=float(substitute_data.get("carboidrato_g", 0)),
                fibra_g=float(substitute_data.get("fibra_g", 0)),
            )

            grupo = identificar_grupo_nutricional(alimento_original.nome)

            if not grupo:
                return Response(
                    {
                        "error": f"Não foi possível identificar o grupo nutricional do alimento: {alimento_original.nome}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            resultado = calcular_substituicao(
                alimento_original, alimento_substituto, grupo, quantity_original
            )

            return Response(
                {
                    "original": f"{resultado.alimento_original} {resultado.quantidade_original_g}g ({resultado.calorias_original} kcal)",
                    "substitute": f"{resultado.alimento_substituto} {resultado.quantidade_substituto_g}g ({resultado.calorias_substituto} kcal)",
                    "group": resultado.grupo,
                    "macro_equalized": resultado.macronutriente_igualizado,
                    "calorie_difference": resultado.diferenca_calorica,
                    "calories_per_100g_original": resultado.calorias_por_100g_original,
                    "calories_per_100g_substitute": resultado.calorias_por_100g_substituto,
                    "quantity_original_g": resultado.quantidade_original_g,
                    "quantity_substitute_g": resultado.quantidade_substituto_g,
                    "calories_original": resultado.calorias_original,
                    "calories_substitute": resultado.calorias_substituto,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Erro ao calcular substituição: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["GET"])
    def suggest_substitutions(self, request):
        """
        GET /api/v1/foods/suggest_substitutions/
        Sugere substituições para um alimento específico.

        Query params:
        - food_name: Nome do alimento original (ex: "arroz, integral, cozido")
        - source: Fonte do alimento (TACO, TBCA, USDA)
        - quantity_original_g: Quantidade original em gramas (padrão: 100)
        - limit: Número máximo de sugestões (padrão: 10)

        Response:
        {
            "original_food": {...},
            "group": "carboidratos_complexos",
            "substitutions": [
                {
                    "name": "batata, doce, cozida",
                    "quantity_g": 144.1,
                    "calories": 111.0,
                    "calorie_difference": 13.0,
                    "source": "TACO"
                },
                ...
            ]
        }
        """
        from .nutritional_substitution import (
            sugerir_substitucoes,
            identificar_grupo_nutricional,
            NutricaoAlimento,
            alimento_taco_para_nutricao,
            alimento_tbca_para_nutricao,
            alimento_usda_para_nutricao,
        )

        food_name = request.query_params.get("food_name", "")
        source = request.query_params.get("source", "TACO")
        quantity_original = float(request.query_params.get("quantity_original_g", 100))
        limit = int(request.query_params.get("limit", 10))

        if not food_name:
            return Response(
                {"error": "food_name é obrigatório"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            alimento_original = None
            alimentos_substitutos = []

            if source == "TACO":
                try:
                    food_obj = AlimentoTACO.objects.get(nome__icontains=food_name)
                    alimento_original = alimento_taco_para_nutricao(food_obj)
                    alimentos_substitutos = [
                        alimento_taco_para_nutricao(f)
                        for f in AlimentoTACO.objects.all()[:500]
                    ]
                except AlimentoTACO.DoesNotExist:
                    pass

            elif source == "TBCA":
                try:
                    food_obj = AlimentoTBCA.objects.get(nome__icontains=food_name)
                    alimento_original = alimento_tbca_para_nutricao(food_obj)
                    alimentos_substitutos = [
                        alimento_tbca_para_nutricao(f)
                        for f in AlimentoTBCA.objects.all()[:500]
                    ]
                except AlimentoTBCA.DoesNotExist:
                    pass

            elif source == "USDA":
                try:
                    food_obj = AlimentoUSDA.objects.get(nome__icontains=food_name)
                    alimento_original = alimento_usda_para_nutricao(food_obj)
                    alimentos_substitutos = [
                        alimento_usda_para_nutricao(f)
                        for f in AlimentoUSDA.objects.all()[:500]
                    ]
                except AlimentoUSDA.DoesNotExist:
                    pass

            if not alimento_original:
                return Response(
                    {"error": f"Alimento não encontrado: {food_name}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            grupo = identificar_grupo_nutricional(alimento_original.nome)

            if not grupo:
                return Response(
                    {
                        "error": f"Não foi possível identificar o grupo nutricional do alimento: {alimento_original.nome}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            resultados = sugerir_substitucoes(
                alimento_original, alimentos_substitutos, quantity_original, limit
            )

            substitutions_response = []
            for r in resultados:
                substitutions_response.append(
                    {
                        "name": r.alimento_substituto,
                        "quantity_g": r.quantidade_substituto_g,
                        "calories": r.calorias_substituto,
                        "calorie_difference": r.diferenca_calorica,
                        "source": alimento_original.fonte,
                    }
                )

            return Response(
                {
                    "original_food": {
                        "name": alimento_original.nome,
                        "quantity_g": quantity_original,
                        "calories": round(
                            (alimento_original.energia_kcal * quantity_original) / 100,
                            1,
                        ),
                        "source": alimento_original.fonte,
                    },
                    "group": grupo,
                    "substitutions": substitutions_response,
                }
            )

        except Exception as e:
            return Response(
                {"error": f"Erro ao sugerir substituições: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class DietViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de dietas."""

    serializer_class = DietSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Se a nova dieta for ativa, desative as outras do mesmo paciente
        is_active = self.request.data.get("is_active", True)
        patient_id = self.request.data.get("patient")

        if is_active and patient_id:
            Diet.objects.filter(patient_id=patient_id, is_active=True).update(
                is_active=False
            )

        serializer.save()

    @action(detail=True, methods=["POST"], parser_classes=[MultiPartParser, FormParser])
    def upload_pdf(self, request, pk=None):
        """
        Upload de arquivo PDF para a dieta.
        """
        diet = self.get_object()

        if "file" not in request.data:
            return Response(
                {"error": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST
            )

        file_obj = request.data["file"]

        # Validar tipo de arquivo
        if not file_obj.name.lower().endswith(".pdf"):
            return Response(
                {"error": "O arquivo deve ser um PDF."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        diet.pdf_file = file_obj
        diet.save()

        return Response(
            {"status": "PDF salvo com sucesso", "pdf_url": diet.pdf_file.url}
        )

    def get_queryset(self):
        queryset = Diet.objects.filter(patient__nutritionist=self.request.user)

        patient_id = self.request.query_params.get("patient")
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        return queryset


class MealViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de refeições."""

    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Meal.objects.filter(diet__patient__nutritionist=self.request.user)

        diet_id = self.request.query_params.get("diet")
        if diet_id:
            queryset = queryset.filter(diet_id=diet_id)

        return queryset


class MealPresetViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de presets de refeições."""

    serializer_class = MealPresetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MealPreset.objects.filter(nutritionist=self.request.user)

        # Filtros opcionais
        meal_type = self.request.query_params.get("meal_type")
        if meal_type:
            queryset = queryset.filter(meal_type=meal_type)

        diet_type = self.request.query_params.get("diet_type")
        if diet_type:
            queryset = queryset.filter(diet_type=diet_type)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset

    def perform_create(self, serializer):
        # Associar automaticamente ao nutricionista autenticado
        serializer.save(nutritionist=self.request.user)


class FoodItemViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de itens alimentares."""

    serializer_class = FoodItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FoodItem.objects.filter(
            meal__diet__patient__nutritionist=self.request.user
        )

        meal_id = self.request.query_params.get("meal")
        if meal_id:
            queryset = queryset.filter(meal_id=meal_id)

        return queryset


class DefaultPresetViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciamento de presets padro."""

    serializer_class = DefaultPresetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = DefaultPreset.objects.filter(nutritionist=self.request.user)

        # Filtros opcionais
        meal_type = self.request.query_params.get("meal_type")
        if meal_type:
            queryset = queryset.filter(meal_type=meal_type)

        diet_type = self.request.query_params.get("diet_type")
        if diet_type:
            queryset = queryset.filter(diet_type=diet_type)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        return queryset

    def perform_create(self, serializer):
        # Associar automaticamente ao nutricionista autenticado
        serializer.save(nutritionist=self.request.user)

    def perform_update(self, serializer):
        # Garantir que o nutricionista não seja alterado
        serializer.save(nutritionist=self.request.user)


class FoodSubstitutionRuleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de regras globais de substituição.
    Usado por administradores para definir substituições padrão.
    """

    serializer_class = FoodSubstitutionRuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FoodSubstitutionRule.objects.filter(is_active=True)

        # Filtros opcionais
        diet_type = self.request.query_params.get("diet_type")
        if diet_type:
            queryset = queryset.filter(diet_type=diet_type)

        original_food_id = self.request.query_params.get("original_food_id")
        if original_food_id:
            queryset = queryset.filter(original_food_id=original_food_id)

        nutrient_predominant = self.request.query_params.get("nutrient_predominant")
        if nutrient_predominant:
            queryset = queryset.filter(nutrient_predominant=nutrient_predominant)

        return queryset.select_related("created_by").order_by(
            "diet_type", "priority", "-similarity_score"
        )

    def perform_create(self, serializer):
        # Associar automaticamente ao usuário autenticado
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["GET"])
    def suggest(self, request):
        """
        Busca substituições inteligentes para um alimento.
        Retorna substituições favoritas do nutricionista + globais.
        """
        print(">>> FoodSubstitutionRuleViewSet.suggest CALLED <<<")
        food_id = request.query_params.get("food_id")
        food_source = request.query_params.get("food_source", "TACO")
        diet_type = request.query_params.get("diet_type")
        original_quantity = float(request.query_params.get("quantity", 100))
        if original_quantity <= 0:
            original_quantity = 100

        if not all([food_id, diet_type]):
            return Response(
                {"error": "Parâmetros obrigatórios: food_id, diet_type"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Converter food_id para int if needed
        if food_source != "IBGE":
            try:
                food_id = int(float(food_id))
            except (ValueError, TypeError):
                return Response(
                    {"error": f"food_id inválido: {food_id}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if diet_type == "balanced":
            diet_type = "normocalorica"

        # 1. Buscar dados do alimento original
        original_food = self._get_food_data(food_source, food_id)
        if not original_food:
            return Response(
                {"error": "Alimento não encontrado"}, status=status.HTTP_404_NOT_FOUND
            )

        # 2. Identificar macronutriente e grupo profissional
        predominant = self._identify_predominant_nutrient(original_food)
        orig_prof_group = self._get_professional_group(original_food)

        # 3. Buscar favoritas do nutricionista
        favorite_subs = NutritionistSubstitutionFavorite.objects.filter(
            nutritionist=request.user,
            original_food_id=food_id,
            diet_type=diet_type,
            is_active=True,
        ).order_by("priority")

        # 4. Buscar substituições globais (ou fallback)
        global_subs_query = FoodSubstitutionRule.objects.filter(
            original_food_id=food_id,
            diet_type=diet_type,
            nutrient_predominant=predominant,
            is_active=True,
        ).order_by("-similarity_score", "priority")

        if not global_subs_query.exists():
            global_subs_query = FoodSubstitutionRule.objects.filter(
                diet_type=diet_type, nutrient_predominant=predominant, is_active=True
            ).order_by("-similarity_score", "priority")[:60]

        # 5. Filtragem por Grupo Profissional e Diversidade - COM DEDUPLICAÇÃO INICIAL
        results = []
        seen_food_ids = set()
        seen_base_names = set()
        favorite_base_names = set()  # Adicionando a variável que estava faltando

        # 5a. Processar Favoritas - COM VERIFICAÇÃO DE DUPLICATAS E FILTRO DE CRUZ
        for fav in favorite_subs:
            subst_food = self._get_food_data(
                fav.substitute_source, fav.substitute_food_id
            )
            if subst_food:
                # Filtrar alimentos crus em favoritas também
                if any(kw in subst_food.nome.lower() for kw in ["cru", "crua"]):
                    continue
                # Verificar duplicata por ID e nome base
                base_name = subst_food.nome.split(",")[0].strip().lower()
                if subst_food.id not in seen_food_ids and base_name not in seen_base_names:
                    results.append(
                        {
                            "id": f"fav_{fav.id}",
                            "food": UnifiedFoodSerializer(subst_food).data,
                            "suggested_quantity": float(fav.suggested_quantity),
                            "similarity_score": float(fav.similarity_score),
                            "is_favorite": True,
                            "is_selected": True,
                            "priority": fav.priority,
                            "notes": fav.notes,
                        }
                    )
                    seen_food_ids.add(subst_food.id)
                    seen_base_names.add(base_name)
                    favorite_base_names.add(base_name)  # Adicionando também às favoritas

        # 5b. Processar Globais com filtro estrito de grupo e preparo
        best_subs = {}  # {base_name: item}

        # Filtros agressivos de qualidade (Excluir sobremesas, pratos complexos e junk food)
        excluded_keywords = [
            "molho",
            "carbonara",
            "bolognesa",
            "pesto",
            "recheado",
            "lasanha",
            "pizza",
            "torta",
            "sanduíche",
            "bolo",
            "biscoito",
            "gelatina",
            "sorvete",
            "chocolate",
            "recheada",
            "refresco",
            "refrigerante",
            "salgadinho",
            "industrializ",
            "pronto",
            "congelado",
            "farinha",
            "torrada",
            "cru",
            "crua",
        ]

        for sub in global_subs_query:
            if sub.substitute_food_id in seen_food_ids:
                continue

            subst_food = self._get_food_data(
                sub.substitute_source, sub.substitute_food_id
            )
            if not subst_food:
                continue

            sub_name_low = subst_food.nome.lower()

            # --- FILTROS DE QUALIDADE (FAIL-SAFE) ---

            # 1. Grupo Profissional (Fundamental)
            sub_prof_group = self._get_professional_group(subst_food)
            if orig_prof_group != "OTHER" and sub_prof_group != orig_prof_group:
                continue

            # 2. Impedir pratos complexos / Junk food
            if any(kw in sub_name_low for kw in excluded_keywords):
                continue

            # 3. Excluir "doce" exceto batata doce e frutas específicas
            if "doce" in sub_name_low and not any(
                x in sub_name_low
                for x in [
                    "batata doce",
                    "batata, doce",
                    "fruta",
                    "abacaxi",
                    "banana",
                    "maçã",
                    "maca",
                    "laranja",
                    "pêra",
                    "pera",
                    "mamão",
                    "mamao",
                    "manga",
                ]
            ):
                continue

            # 4. Forçar COZIDO/PREPARADO para grupos principais (Não sugerir ingredientes crus)
            is_sub_cooked = any(
                x in sub_name_low
                for x in [
                    "cozido",
                    "cozida",
                    "grelhado",
                    "assado",
                    "frito",
                    "refogado",
                    "pão",
                    "pao",
                    "assada",
                    "grelhada",
                ]
            )
            if not is_sub_cooked and orig_prof_group in [
                "CARB",
                "PROTEIN_LEAN",
                "LEGUME",
            ]:
                # print(f"DEBUG: SKIPPED RAW: {subst_food.nome}")
                continue

            # 5. Validar se o macro principal não é ZERO
            if orig_prof_group == "CARB" and subst_food.carboidrato_g <= 1.0:
                continue
            if orig_prof_group == "PROTEIN_LEAN" and subst_food.proteina_g <= 1.0:
                continue

            # 6. Validar similaridade nutricional pela razão de macros
            if (
                orig_prof_group == "CARB"
                and original_food.energia_kcal > 0
                and subst_food.energia_kcal > 0
            ):
                orig_carb_pct = original_food.carboidrato_g / original_food.energia_kcal
                sub_carb_pct = subst_food.carboidrato_g / subst_food.energia_kcal
                carb_diff = abs(orig_carb_pct - sub_carb_pct)
                if carb_diff > 0.3:
                    continue
            elif (
                orig_prof_group == "PROTEIN_LEAN"
                and original_food.energia_kcal > 0
                and subst_food.energia_kcal > 0
            ):
                orig_prot_pct = original_food.proteina_g / original_food.energia_kcal
                sub_prot_pct = subst_food.proteina_g / subst_food.energia_kcal
                prot_diff = abs(orig_prot_pct - sub_prot_pct)
                if prot_diff > 0.3:
                    continue

            # 7. Diversidade por base_name
            base_name = sub.substitute_food_name.split(",")[0].strip().lower()
            if base_name in seen_base_names or (
                base_name in best_subs
                and sub.similarity_score <= best_subs[base_name]["score"]
            ):
                continue

            # 7. Calcular quantidade dinâmica baseada na equivalência nutricional (Ignorar valor fixo do banco)
            final_qty = self._calculate_nutritional_equivalence(
                original_food, subst_food, original_quantity, orig_prof_group
            )

            best_subs[base_name] = {
                "id": f"global_{sub.id}",
                "food": UnifiedFoodSerializer(subst_food).data,
                "suggested_quantity": round(final_qty, 1),
                "similarity_score": float(sub.similarity_score),
                "is_favorite": False,
                "is_selected": False,
                "priority": sub.priority,
                "notes": sub.notes,
                "score": sub.similarity_score,
            }
            if len(best_subs) >= 15:
                break

        # Adicionar os melhores substitutos com verificação de duplicatas
        for item in best_subs.values():
            food_id = item["food"]["id"]
            food_name_base = item["food"]["nome"].split(",")[0].strip().lower()

            # Verificar duplicata antes de adicionar
            if food_id not in seen_food_ids and food_name_base not in seen_base_names:
                results.append(item)
                seen_food_ids.add(food_id)
                seen_base_names.add(food_name_base)

        # 5c. Injeção de Staples (IDs Seguros da TACO)
        # Identificar se o original e arroz para evitar mostrar o mesmo tipo
        orig_is_arroz_int = original_food.nome.lower().startswith("arroz, integral")
        orig_is_arroz_tipo1 = original_food.nome.lower().startswith("arroz, tipo 1")
        orig_is_arroz_tipo2 = original_food.nome.lower().startswith("arroz, tipo 2")

        safe_staples = []
        if orig_prof_group == "CARB":
            # Montar lista excluindo o mesmo tipo de arroz
            arroz_staples = []
            if not orig_is_arroz_int:
                arroz_staples.append(("TACO", 1, "Arroz, integral, cozido"))
            if not orig_is_arroz_tipo1:
                arroz_staples.append(("TACO", 3, "Arroz, tipo 1, cozido"))
            if not orig_is_arroz_tipo2:
                arroz_staples.append(("TACO", 5, "Arroz, tipo 2, cozido"))

            safe_staples = arroz_staples + [
                ("TBCA", 2691, "Macarrão, trigo, integral, cozido"),
                ("TACO", 91, "Batata, inglesa, cozida"),
                ("TACO", 86, "Batata, baroa, cozida"),
                ("TACO", 129, "Mandioca, cozida"),
                ("TACO", 88, "Batata, doce, cozida"),
                ("TACO", 102, "Cará, cozido"),
            ]
        elif orig_prof_group == "PROTEIN_LEAN":
            safe_staples = [
                ("TACO", 410, "Frango, peito, sem pele, grelhado"),
                ("TACO", 377, "Carne, bovina, patinho, sem gordura, grelhado"),
                ("TBCA", 5196, "Peixe, Tilápia, filé, grelhado"),
                ("TACO", 358, "Carne, bovina, filé mignon, grelhado"),
                ("TACO", 488, "Ovo, de galinha, inteiro, cozido"),
                ("TACO", 432, "Porco, lombo, assado"),
                ("TACO", 277, "Peixe, atum, em conserva"),
                ("TACO", 346, "Carne, bovina, contra-filé, sem gordura, grelhado"),
            ]

        # Atualizar o conjunto de IDs vistos com os resultados atuais
        for r in results:
            fid = r["food"].get("id")
            if fid:
                seen_food_ids.add(fid)

        # Sistema avançado de deduplicação para staples
        for source, sid, sname in safe_staples:
            if len(results) >= 30:
                break
            if sid in seen_food_ids:
                continue

            # 4. Filtrar se for cru/crua (Garantir que não escape nada)
            if any(kw in sname.lower() for kw in ["cru", "crua"]):
                continue

            st_food = self._get_food_data(source, sid)
            if st_food:
                # Verificar duplicata por nome MAIS específico para proteínas (evitar barrar todos os 'Carne')
                parts = st_food.nome.split(",")
                base_name = parts[0].strip().lower()
                specific_name = (parts[0] + (parts[1] if len(parts) > 1 else "")).strip().lower()
                
                if specific_name in seen_base_names:
                    continue  # Evitar duplicata funcional real

                qty = self._calculate_nutritional_equivalence(
                    original_food, st_food, original_quantity, orig_prof_group
                )
                results.append(
                    {
                        "id": f"staple_{st_food.id}",
                        "food": UnifiedFoodSerializer(st_food).data,
                        "suggested_quantity": qty,
                        "similarity_score": 0.70,
                        "is_favorite": False,
                        "is_selected": False,
                        "priority": 100,
                        "notes": "Opção clássica sugerida.",
                    }
                )
                seen_food_ids.add(st_food.id)
                seen_base_names.add(st_food.nome.split(",")[0].strip().lower())

        # 5d. Adicionar leguminosas para carboidratos (se ainda houver espaço) - COM DEDUPLICAÇÃO
        if orig_prof_group == "CARB" and len(results) < 30:
            legume_staples = [
                ("TACO", 567, "Feijão, preto, cozido"),
                ("TACO", 561, "Feijão, carioca, cozido"),
                ("TACO", 577, "Lentilha, cozida"),
            ]
            for source, sid, sname in legume_staples:
                if len(results) >= 30:
                    break
                if sid in seen_food_ids:
                    continue

                st_food = self._get_food_data(source, sid)
                if st_food:
                    # Verificar duplicata por nome base
                    base_name = st_food.nome.split(",")[0].strip().lower()
                    if base_name in seen_base_names:
                        continue  # Evitar duplicata funcional

                    qty = self._calculate_nutritional_equivalence(
                        original_food, st_food, original_quantity, "LEGUME"
                    )
                    results.append(
                        {
                            "id": f"legume_{st_food.id}",
                            "food": UnifiedFoodSerializer(st_food).data,
                            "suggested_quantity": qty,
                            "similarity_score": 0.70,
                            "is_favorite": False,
                            "is_selected": False,
                            "priority": 110,
                            "notes": "Opção de leguminosa rica em carboidratos.",
                        }
                    )
                    seen_food_ids.add(st_food.id)
                    seen_base_names.add(st_food.nome.split(",")[0].strip().lower())

        # Aplicar deduplicação final para garantir que não haja duplicatas
        unique_results = []
        seen_food_ids_final = set()
        seen_food_names_final = set()

        for result in results:
            food_id = result["food"]["id"]
            food_name_base = result["food"]["nome"].split(",")[0].strip().lower()

            if food_id not in seen_food_ids_final and food_name_base not in seen_food_names_final:
                unique_results.append(result)
                seen_food_ids_final.add(food_id)
                seen_food_names_final.add(food_name_base)

        return Response({"substitutions": unique_results, "predominant": predominant})

    def _get_food_data(self, source, food_id):
        """Busca dados do alimento na fonte especificada"""

        # Classe auxiliar para simular um objeto de modelo para o serializer
        class Box:
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)

        try:
            # Converter food_id para int se for string numérica (exceto para IBGE)
            if source != "IBGE" and isinstance(food_id, str):
                try:
                    food_id = int(float(food_id))
                except (ValueError, TypeError):
                    pass

            if source == "TACO":
                return AlimentoTACO.objects.get(id=food_id)
            elif source == "TBCA":
                return AlimentoTBCA.objects.get(id=food_id)
            elif source == "USDA":
                return AlimentoUSDA.objects.get(fdc_id=food_id)
            elif source == "IBGE":
                # Para IBGE, buscamos no cache global do FoodSearchViewSet
                FoodSearchViewSet.ensure_cache()
                cache_item = FoodSearchViewSet.IBGE_CACHE.get(str(food_id))
                if cache_item:
                    # Mapear campos do cache para campos que o UnifiedFoodSerializer espera
                    return Box(
                        id=cache_item["id"],
                        nome=cache_item["nome"],
                        grupo=cache_item["grupo"],
                        source="IBGE",
                        energia_kcal=cache_item["energia_kcal"],
                        proteina_g=cache_item["proteina_g"],
                        lipidios_g=cache_item["lipidios_g"],
                        carboidrato_g=cache_item["carboidrato_g"],
                        fibra_g=cache_item.get("fibra_g", 0),
                        unidade_caseira=cache_item.get("medida_nome"),
                        peso_unidade_caseira_g=cache_item.get("peso_g"),
                    )
            return None
        except (
            AlimentoTACO.DoesNotExist,
            AlimentoTBCA.DoesNotExist,
            AlimentoUSDA.DoesNotExist,
        ) as e:
            print(
                f"DEBUG: _get_food_data error - source={source}, food_id={food_id}, error={type(e).__name__}"
            )
            return None

    def _identify_predominant_nutrient(self, food):
        """Identifica o macronutriente predominante do alimento"""
        protein = food.proteina_g
        carbs = food.carboidrato_g
        fats = food.lipidios_g

        if carbs > protein and carbs > fats:
            return "carb"
        elif protein > carbs and protein > fats:
            return "protein"
        else:
            return "fat"

    def _get_professional_group(self, food):
        """Classifica o alimento em um grupo profissional para evitar trocas ilógicas"""
        name = food.nome.lower()
        # Se for TACO, usa o grupo da base como apoio
        taco_group = getattr(food, "grupo", "").lower()

        # Excluir ultraprocessados e doces de grupos principais
        # Usamos regex ou verificações mais precisas para não pegar 'batata doce'
        is_junk = any(
            x in name
            for x in [
                "bolo",
                "biscoito",
                "bolacha",
                "refrigerante",
                "sorvete",
                "salgadinho",
                "pizza",
                "lasanha",
            ]
        )
        # 'doce' sozinho ou em contextos de sobremesa, mas não 'batata doce'
        if "doce" in name and "batata" not in name and "fruta" not in name:
            is_junk = True

        if is_junk:
            return "OTHER"

        # Proteínas Magras
        if any(
            x in name
            for x in [
                "frango",
                "peixe",
                "ovo",
                "clara",
                "patinho",
                "maminha",
                "filé mignon",
                "file mignon",
            ]
        ):
            return "PROTEIN_LEAN"
        # Leguminosas
        if any(
            x in name
            for x in [
                "feijao",
                "feijão",
                "lentilha",
                "grao de bico",
                "grão-de-bico",
                "soja",
                "ervilha",
            ]
        ):
            return "LEGUME"
        # Carboidratos / Amiláceos / Tubérculos
        if any(
            x in name
            for x in [
                "arroz",
                "batata",
                "mandioca",
                "aipim",
                "inhame",
                "cuscuz",
                "aveia",
                "milho",
                "quinoa",
                "macarrao",
                "macarrão",
                "trigo",
                "pão",
                "pao",
                "farinha",
                "polvilho",
            ]
        ):
            return "CARB"
        # Frutas
        if "fruta" in taco_group or any(
            x in name
            for x in [
                "banana",
                "maçã",
                "maca",
                "laranja",
                "abacaxi",
                "abacate",
                "manga",
                "uva",
                "pera",
                "pêra",
                "mamão",
                "mamao",
                "melancia",
                "melão",
                "melao",
                "morango",
            ]
        ):
            return "FRUIT"
        # Vegetais / Hortaliças
        if (
            "verdura" in taco_group
            or "hortali" in taco_group
            or any(
                x in name
                for x in [
                    "alface",
                    "tomate",
                    "pepino",
                    "abóbora",
                    "abobora",
                    "abobrinha",
                    "brócolis",
                    "brocolis",
                    "vagem",
                    "cenoura",
                    "beterraba",
                    "chuchu",
                ]
            )
        ):
            return "VEGGIE"

        return "OTHER"

    def _calculate_nutritional_equivalence(
        self, original_food, substitute_food, original_quantity, professional_group
    ):
        """Calcula a quantidade do substituto baseada no macro predominante do grupo profissional"""
        if not original_food or not substitute_food or not original_food.energia_kcal:
            return original_quantity

        # Se o alimento original tem 0 de energia (improvável), retorna original
        if original_food.energia_kcal == 0 or substitute_food.energia_kcal == 0:
            return original_quantity

        # Determinar qual macro usar para a equivalência
        if professional_group in ["CARB", "LEGUME", "FRUIT"]:
            orig_val = original_food.carboidrato_g
            sub_val = substitute_food.carboidrato_g
        elif professional_group == "PROTEIN_LEAN":
            orig_val = original_food.proteina_g
            sub_val = substitute_food.proteina_g
        else:
            # Fallback para calorias se não for um grupo específico de carb/proteína
            orig_val = original_food.energia_kcal
            sub_val = substitute_food.energia_kcal

        if not orig_val or not sub_val or sub_val == 0:
            # Fallback para calorias se o macro específico for zero
            orig_val = original_food.energia_kcal
            sub_val = substitute_food.energia_kcal

        if not orig_val or not sub_val or sub_val == 0:
            return original_quantity

        orig_total = (original_quantity / 100.0) * orig_val
        sub_needed_qty = (orig_total / sub_val) * 100.0

        # Teto de segurança: No máximo 10x a porção original (evitar 8kg de manga)
        max_limit = original_quantity * 10
        if sub_needed_qty > max_limit:
            return max_limit

        return round(sub_needed_qty, 1)

    @action(detail=False, methods=["POST"])
    def toggle_favorite(self, request):
        """Toggle favorito para uma substituição"""
        substitution_id = request.data.get("substitution_id")
        is_favorite = request.data.get("is_favorite", True)

        if not substitution_id:
            return Response(
                {"error": "substitution_id é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse substitution_id para extrair tipo e ID
        if substitution_id.startswith("fav_"):
            # Já é favorita - desfavoritar
            fav_id = substitution_id.replace("fav_", "")
            try:
                favorite = NutritionistSubstitutionFavorite.objects.get(
                    id=fav_id, nutritionist=request.user
                )
                favorite.delete()
                return Response({"is_favorite": False})
            except NutritionistSubstitutionFavorite.DoesNotExist:
                return Response(
                    {"error": "Favorito não encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        elif substitution_id.startswith("global_"):
            # É global - criar favorita
            global_id = substitution_id.replace("global_", "")
            try:
                global_sub = FoodSubstitutionRule.objects.get(id=global_id)
            except FoodSubstitutionRule.DoesNotExist:
                return Response(
                    {"error": "Regra global não encontrada"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Criar favorita
            NutritionistSubstitutionFavorite.objects.create(
                nutritionist=request.user,
                original_source=global_sub.original_source,
                original_food_id=global_sub.original_food_id,
                original_food_name=global_sub.original_food_name,
                diet_type=global_sub.diet_type,
                substitute_source=global_sub.substitute_source,
                substitute_food_id=global_sub.substitute_food_id,
                substitute_food_name=global_sub.substitute_food_name,
                suggested_quantity=global_sub.suggested_quantity,
                similarity_score=global_sub.similarity_score,
                priority=10,
            )
            return Response({"is_favorite": True})

        return Response(
            {"error": "Formato de substitution_id inválido"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["POST"])
    def save_selection(self, request):
        """Salva as substituições selecionadas pelo nutricionista"""
        original_food_id = request.data.get("original_food_id")
        diet_type = request.data.get("diet_type")
        selected_substitution_ids = request.data.get("selected_substitution_ids", [])

        if not all([original_food_id, diet_type]):
            return Response(
                {"error": "original_food_id e diet_type são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Remover favoritas antigas não selecionadas
        old_favorites = NutritionistSubstitutionFavorite.objects.filter(
            nutritionist=request.user,
            original_food_id=original_food_id,
            diet_type=diet_type,
        )

        # IDs das favoritas existentes
        existing_fav_ids = set(f"fav_{f.id}" for f in old_favorites)

        # IDs a manter
        keep_ids = set(selected_substitution_ids)

        # Remover favoritas não selecionadas
        for fav_id in existing_fav_ids - keep_ids:
            fav = old_favorites.filter(id=fav_id.replace("fav_", "")).first()
            if fav:
                fav.delete()

        # Marcar as selecionadas como favoritas (se não forem)
        for sub_id in selected_substitution_ids:
            if sub_id.startswith("global_"):
                # Criar favorita da global
                global_id = sub_id.replace("global_", "")
                try:
                    global_sub = FoodSubstitutionRule.objects.get(id=global_id)
                    NutritionistSubstitutionFavorite.objects.get_or_create(
                        nutritionist=request.user,
                        original_source=global_sub.original_source,
                        original_food_id=global_sub.original_food_id,
                        diet_type=global_sub.diet_type,
                        substitute_food_id=global_sub.substitute_food_id,
                        defaults={
                            "original_food_name": global_sub.original_food_name,
                            "substitute_source": global_sub.substitute_source,
                            "substitute_food_name": global_sub.substitute_food_name,
                            "suggested_quantity": global_sub.suggested_quantity,
                            "similarity_score": global_sub.similarity_score,
                            "priority": 10,
                        },
                    )
                except FoodSubstitutionRule.DoesNotExist:
                    continue

        return Response({"success": True})


class NutritionistSubstitutionFavoriteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de favoritos de substituição.
    Cada nutricionista pode ter suas próprias preferências.
    """

    serializer_class = NutritionistSubstitutionFavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = NutritionistSubstitutionFavorite.objects.filter(
            nutritionist=self.request.user, is_active=True
        )

        # Filtros opcionais
        diet_type = self.request.query_params.get("diet_type")
        if diet_type:
            queryset = queryset.filter(diet_type=diet_type)

        original_food_id = self.request.query_params.get("original_food_id")
        if original_food_id:
            queryset = queryset.filter(original_food_id=original_food_id)

        return queryset.order_by("diet_type", "priority")

    def perform_create(self, serializer):
        # Associar automaticamente ao nutricionista autenticado
        serializer.save(nutritionist=self.request.user)


# =============================================================================
# VIEWSET DE GRUPOS DE SUBSTITUIÇÃO
# =============================================================================


class FoodSubstitutionGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de grupos de substituição de alimentos.
    """

    serializer_class = FoodSubstitutionGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FoodSubstitutionGroup.objects.filter(is_active=True)

        predominant_nutrient = self.request.query_params.get("predominant_nutrient")
        if predominant_nutrient:
            queryset = queryset.filter(predominant_nutrient=predominant_nutrient)

        return queryset.order_by("name")

    def perform_create(self, serializer):
        serializer.save()


# =============================================================================
# VIEWSET DE SUBSTITUIÇÃO DE ALIMENTOS (POR REFEIÇÃO)
# =============================================================================


class FoodSubstitutionsViewSet(viewsets.ViewSet):
    """
    ViewSet para gerenciamento de substituições de alimentos.
    Oferece substitutos com equivalência nutricional baseada no macronutriente predominante.
    """

    permission_classes = [IsAuthenticated]

    def list(self, request, meal_id=None, food_item_id=None):
        """
        GET /meals/{meal_id}/foods/{food_item_id}/substitutes/
        Retorna até 7 substitutos com equivalência nutricional calculada.
        """
        try:
            food_item = FoodItem.objects.get(id=food_item_id, meal_id=meal_id)
        except FoodItem.DoesNotExist:
            return Response(
                {"error": "Item de alimento não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        protein = float(food_item.protein)
        carbs = float(food_item.carbs)
        fats = float(food_item.fats)

        if carbs >= protein and carbs >= fats:
            predominant = "carbs"
            original_nutrient = carbs
        elif protein >= carbs and protein >= fats:
            predominant = "protein"
            original_nutrient = protein
        else:
            predominant = "fat"
            original_nutrient = fats

        original_source = None
        original_food_id = None

        if food_item.taco_food_id:
            original_source = "TACO"
            original_food_id = str(food_item.taco_food_id)
        elif food_item.tbca_food_id:
            original_source = "TBCA"
            original_food_id = str(food_item.tbca_food_id)
        elif food_item.usda_food_id:
            original_source = "USDA"
            original_food_id = str(food_item.usda_food_id)
        else:
            original_source = "TACO"
            original_food_id = None

        substitutions = FoodSubstitution.objects.filter(
            is_approved=True
        ).select_related("group")

        if original_food_id:
            substitutions = substitutions.filter(
                original_source=original_source, original_food_id=original_food_id
            )
        else:
            substitutions = substitutions.filter(
                original_source=original_source,
                original_food_name__icontains=food_item.food_name.split(",")[0],
            )

        group_predominants = {
            "carbs": "carbs",
            "protein": "protein",
            "fat": "fat",
        }
        target_predominant = group_predominants.get(predominant)
        if target_predominant:
            substitutions = substitutions.filter(
                group__predominant_nutrient=target_predominant
            )

        # Filtrar alimentos crus (cru/crua)
        substitutions = [
            s
            for s in substitutions
            if not any(kw in s.substitute_food_name.lower() for kw in ["cru", "crua"])
        ]

        substitutions = substitutions[:7]

        results = []
        for sub in substitutions:
            if predominant == "carbs":
                sub_nutrient = sub.substitute_carbs_per_100g
            elif predominant == "protein":
                sub_nutrient = sub.substitute_protein_per_100g
            else:
                sub_nutrient = sub.substitute_fat_per_100g

            # Usar a nova lógica de arredondamento e precisão para garantir equivalência
            original_quantity = float(food_item.quantity)
            if sub_nutrient and sub_nutrient > 0:
                # Cálculo: (Quantidade de macro na porção original / Quantidade de macro em 100g do substituto) * 100
                equivalent_quantity = (original_nutrient / float(sub_nutrient)) * 100.0
            else:
                equivalent_quantity = original_quantity

            multiplier = equivalent_quantity / 100

            results.append(
                {
                    "substitute_food_id": sub.substitute_food_id,
                    "substitute_food_name": sub.substitute_food_name,
                    "substitute_source": sub.substitute_source,
                    "equivalent_quantity_g": round(equivalent_quantity, 1),
                    "equivalent_quantity_display": f"{equivalent_quantity:.0f}g"
                    if equivalent_quantity >= 10
                    else f"{equivalent_quantity:.1f}g",
                    "predominant_nutrient": predominant,
                    "macros": {
                        "calories": round(
                            sub.substitute_calories_per_100g * multiplier, 1
                        ),
                        "protein": round(
                            sub.substitute_protein_per_100g * multiplier, 1
                        ),
                        "carbs": round(sub.substitute_carbs_per_100g * multiplier, 1),
                        "fat": round(sub.substitute_fat_per_100g * multiplier, 1),
                        "fiber": round(sub.substitute_fiber_per_100g * multiplier, 1),
                    },
                    "original_macros": {
                        "calories": float(food_item.calories),
                        "protein": float(food_item.protein),
                        "carbs": float(food_item.carbs),
                        "fat": float(food_item.fats),
                    },
                }
            )

        return Response(
            {
                "original_food": {
                    "name": food_item.food_name,
                    "quantity": float(food_item.quantity),
                    "unit": food_item.unit,
                    "macros": {
                        "calories": float(food_item.calories),
                        "protein": float(food_item.protein),
                        "carbs": float(food_item.carbs),
                        "fat": float(food_item.fats),
                    },
                },
                "substitutions": results,
            }
        )

    @action(detail=True, methods=["post"])
    def apply(self, request, meal_id=None, food_item_id=None):
        """
        POST /meals/{meal_id}/foods/{food_item_id}/apply-substitution/
        Aplica uma substituição a um item de alimento.
        """
        data = request.data

        try:
            food_item = FoodItem.objects.get(id=food_item_id, meal_id=meal_id)
        except FoodItem.DoesNotExist:
            return Response(
                {"error": "Item de alimento não encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        food_item.food_name = data.get("substitute_food_name")
        food_item.quantity = data.get("equivalent_quantity_g")
        food_item.unit = "g"
        macros = data.get("macros", {})
        food_item.calories = macros.get("calories", 0)
        food_item.protein = macros.get("protein", 0)
        food_item.carbs = macros.get("carbs", 0)
        food_item.fats = macros.get("fat", 0)
        food_item.fiber = macros.get("fiber", 0)

        source = data.get("substitute_source")
        sub_food_id = data.get("substitute_food_id")

        food_item.taco_food = None
        food_item.tbca_food = None
        food_item.usda_food = None

        if source == "TACO":
            try:
                food_item.taco_food_id = int(sub_food_id)
            except (ValueError, TypeError):
                pass
        elif source == "TBCA":
            try:
                food_item.tbca_food_id = int(sub_food_id)
            except (ValueError, TypeError):
                pass
        elif source == "USDA":
            try:
                food_item.usda_food_id = int(sub_food_id)
            except (ValueError, TypeError):
                pass

        food_item.save()

        return Response(
            {"success": True, "food_item": FoodItemSerializer(food_item).data}
        )
