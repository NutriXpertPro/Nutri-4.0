"""
Módulo de Substituição Nutricional Inteligente

Sistema que calcula substituições de alimentos baseadas em:
1. Similaridade nutricional (mesmo grupo)
2. Equalização pelo macronutriente predominante
3. Validação calórica (diferença máxima de 30kcal)

Autor: Sistema Nutri 4.0
Data: 2025
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from unidecode import unidecode
from .search_utils import calcular_score_radical, normalizar_para_scoring

# =============================================================================
# DEFINIÇÃO DE GRUPOS NUTRICIONAIS
# =============================================================================

GRUPOS_NUTRICIONAIS = {
    # CARBOIDRATOS
    "carboidratos_complexos": {
        "descricao": "Fontes complexas de carboidratos com baixo índice glicêmico",
        "macronutriente_preponderante": "carboidrato",
        "alimentos_recomendados": [
            # TACO/TBCA Simplified for Matching
            "Arroz, integral",
            "Arroz, tipo 1, cozido",
            "Arroz, tipo 2, cozido",
            "Batata, doce, cozida",
            "Batata, inglesa, cozida",
            "Batata, assada",
            "Inhame, cozido",
            "Mandioca, cozida",
            "Mandioca, assada",
            "Pão, integral",
            "Pão, trigo, forma",
            "Aveia, flocos",
            "Quinoa",
            "Trigo, grão",
            "Macarrão, trigo",
            "Milho, verde",
        ],
    },
    "carboidratos_simples": {
        "descricao": "Fontes simples de carboidratos (uso moderado)",
        "macronutriente_preponderante": "carboidrato",
        "alimentos_recomendados": [
            "Banana, prata",
            "Banana, nanica",
            "Maçã, Fuji",
            "Maçã, Gala",
            "Laranja, pêra",
            "Laranja, lima",
            "Mamão, Formosa",
            "Melancia",
            "Pêra",
            "Uva, Itália",
            "Suco, de laranja",
            "Suco, de uva",
        ],
    },
    # PROTEÍNAS ANIMAIS
    "proteinas_animais_magras": {
        "descricao": "Proteínas animais com baixo teor de gordura",
        "macronutriente_preponderante": "proteína",
        "alimentos_recomendados": [
            "Frango, peito",  # Catch grelhado/cozido/cru
            "Peixe, tilápia",
            "Peixe, pescada",
            "Peixe, merluza",
            "Peixe, salmão", # Includes fatty but good
            "Peixe, atum",
            "Ovo, de galinha",
            "Clara, de ovo",
            "Peru",
            "Coelho",
        ],
    },
    "proteinas_animais_gordurosas": {
        "descricao": "Proteínas animais com teor moderado de gordura",
        "macronutriente_preponderante": "proteína",
        "alimentos_recomendados": [
            "Carne, bovina, patinho",
            "Carne, bovina, alcatra",
            "Carne, bovina, contra", # contra-filé
            "Carne, bovina, músculo",
            "Carne, suína, lombo",
            "Carne, suína, pernil",
            "Frango, sobrecoxa",
            "Sardinha",
        ],
    },
    # PROTEÍNAS VEGETAIS
    "leguminosas": {
        "descricao": "Proteínas vegetais de leguminosas",
        "macronutriente_preponderante": "carboidrato",
        "alimentos_recomendados": [
            "Feijão, preto",
            "Feijão, carioca",
            "Feijão, branco",
            "Feijão, fradinho",
            "Lentilha",
            "Grão-de-bico",
            "Ervilha",
            "Soja",
        ],
    },
    "oleaginosas": {
        "descricao": "Proteínas vegetais de oleaginosas (uso moderado)",
        "macronutriente_preponderante": "gordura",
        "alimentos_recomendados": [
            "Castanha-do-Brasil",
            "Castanha, de caju",
            "Amêndoa",
            "Noz",
            "Amendoim",
            "Pistache",
            "Linhaça",
            "Chia",
            "Gergelim",
        ],
    },
    # GORDURAS
    "gorduras_saudaveis": {
        "descricao": "Fontes de gorduras saudáveis (ômega-3, monoinsaturadas)",
        "macronutriente_preponderante": "gordura",
        "alimentos_recomendados": [
            "Óleo, de soja",
            "Óleo, de canola",
            "Óleo, de girassol",
            "Azeite, de oliva",
            "Abacate",
            "Manteiga",
        ],
    },
    "gorduras_laticinios": {
        "descricao": "Laticínios com teor de gordura variável",
        "macronutriente_preponderante": "gordura",
        "alimentos_recomendados": [
            "Queijo, minas",
            "Queijo, muçarela",
            "Queijo, prato",
            "Queijo, parmesão",
            "Queijo, ricota",
            "Iogurte, natural",
            "Leite, de vaca, integral",
            "Leite, de vaca, semidesnatado",
            "Leite, de vaca, desnatado",
        ],
    },
    # VERDURAS E LEGUMES
    "verduras_verdes": {
        "descricao": "Verduras verdes de baixa caloria",
        "macronutriente_preponderante": "calorias",
        "alimentos_recomendados": [
            "Alface",
            "Rúcula",
            "Agrião",
            "Espinafre",
            "Couve",
            "Acelga",
            "Brócolis",
            "Chicória",
        ],
    },
    "legumes_variados": {
        "descricao": "Legumes variados de baixa caloria",
        "macronutriente_preponderante": "calorias",
        "alimentos_recomendados": [
            "Tomate",
            "Cenoura",
            "Beterraba",
            "Abobrinha",
            "Berinjela",
            "Pepino",
            "Pimentão",
            "Cogumelo",
            "Quiabo",
            "Jiló",
            "Vagem",
        ],
    },
    # FRUTAS AVULSAS
    "frutas_citricas": {
        "descricao": "Frutas cítricas",
        "macronutriente_preponderante": "carboidrato",
        "alimentos_recomendados": [
            "Laranja",
            "Limão",
            "Tangerina",
            "Acerola",
            "Abacaxi",
            "Maracujá",
        ],
    },
    "frutas_adocadas": {
        "descricao": "Frutas doces",
        "macronutriente_preponderante": "carboidrato",
        "alimentos_recomendados": [
            "Banana",
            "Maçã",
            "Pêra",
            "Mamão",
            "Melancia",
            "Melão",
            "Uva",
            "Manga",
            "Morango",
            "Pêssego",
        ],
    },
}


# =============================================================================
# CLASSES DE DADOS
# =============================================================================


@dataclass
class NutricaoAlimento:
    """Representa os valores nutricionais de um alimento"""

    nome: str
    energia_kcal: float
    proteina_g: float
    lipidios_g: float
    carboidrato_g: float
    fibra_g: float = 0.0
    grupo: str = ""
    fonte: str = ""  # TACO, TBCA, USDA


@dataclass
class ResultadoSubstituicao:
    """Resultado de uma substituição calculada"""

    alimento_original: str
    alimento_substituto: str
    quantidade_original_g: float
    quantidade_substituto_g: float
    grupo: str
    macronutriente_igualizado: str
    calorias_original: float
    calorias_substituto: float
    diferenca_calorica: float
    calorias_por_100g_original: float
    calorias_por_100g_substituto: float


# =============================================================================
# FUNÇÕES PRINCIPAIS
# =============================================================================


def identificar_grupo_nutricional(alimento_nome: str) -> Optional[str]:
    """
    Identifica o grupo nutricional de um alimento com base no nome.

    Args:
        alimento_nome: Nome do alimento

    Returns:
        Nome do grupo nutricional ou None se não encontrado
    """
    if not alimento_nome:
        return None
        
    nome_normalizado = unidecode(alimento_nome.lower().strip())

    # 1. CASOS ESPECIAIS DE BLOQUEIO OU RESTRICAO TOTAL

    # Água de Coco e Sucos -> Retornar grupo específico para bloqueio
    if ("coco" in nome_normalizado and "agua" in nome_normalizado) or "suco" in nome_normalizado or "nectar" in nome_normalizado:
        return "agua_de_coco"
    
    # Iogurtes -> Grupo exclusivo
    if "iogurte" in nome_normalizado or "yogurte" in nome_normalizado:
        return "iogurtes"
    
    # 2. VERIFICAÇÃO DE GRUPOS PADRÃO (Refinados)
    
    # Laticínios Gerais (Leite, Queijo) - Só cai aqui se NÃO for iogurte
    if "leite" in nome_normalizado and not any(x in nome_normalizado for x in ["coco", "condensado", "creme", "doce"]):
         return "laticinios"

    # Resto dos grupos
    for grupo, dados in GRUPOS_NUTRICIONAIS.items():
        # Normalizar também os alimentos da lista para comparação
        alimentos_grupo = [unidecode(a.lower()) for a in dados["alimentos_recomendados"]]

        # Busca exata primeiro
        if nome_normalizado in alimentos_grupo:
            return grupo

        # Busca por contém
        for alimento in alimentos_grupo:
            alimento_tokens = alimento.split(",")[0].strip() # Pega só o nome base ex "Arroz"
            if alimento_tokens in nome_normalizado:
                return grupo

    return None


# ... existing code ...

def alimento_taco_para_nutricao(alimento_taco) -> NutricaoAlimento:
    """Converte um objeto AlimentoTACO para NutricaoAlimento"""
    return NutricaoAlimento(
        nome=alimento_taco.nome or "Alimento sem nome",
        energia_kcal=safe_val(alimento_taco.energia_kcal),
        proteina_g=safe_val(alimento_taco.proteina_g),
        lipidios_g=safe_val(alimento_taco.lipidios_g),
        carboidrato_g=safe_val(alimento_taco.carboidrato_g),
        fibra_g=safe_val(alimento_taco.fibra_g),
        grupo=alimento_taco.grupo or "",
        fonte="TACO",
    )


def alimento_tbca_para_nutricao(alimento_tbca) -> NutricaoAlimento:
    """Converte um objeto AlimentoTBCA para NutricaoAlimento"""
    return NutricaoAlimento(
        nome=alimento_tbca.nome or "Alimento sem nome",
        energia_kcal=safe_val(alimento_tbca.energia_kcal),
        proteina_g=safe_val(alimento_tbca.proteina_g),
        lipidios_g=safe_val(alimento_tbca.lipidios_g),
        carboidrato_g=safe_val(alimento_tbca.carboidrato_g),
        fibra_g=safe_val(alimento_tbca.fibra_g),
        grupo=alimento_tbca.grupo or "",
        fonte="TBCA",
    )


def alimento_usda_para_nutricao(alimento_usda) -> NutricaoAlimento:
    """Converte um objeto AlimentoUSDA para NutricaoAlimento"""
    return NutricaoAlimento(
        nome=alimento_usda.nome or "Alimento sem nome",
        energia_kcal=safe_val(alimento_usda.energia_kcal),
        proteina_g=safe_val(alimento_usda.proteina_g),
        lipidios_g=safe_val(alimento_usda.lipidios_g),
        carboidrato_g=safe_val(alimento_usda.carboidrato_g),
        fibra_g=safe_val(alimento_usda.fibra_g),
        grupo=alimento_usda.categoria or "",
        fonte="USDA",
    )


def calcular_substituicao(
    alimento_original: NutricaoAlimento,
    alimento_substituto: NutricaoAlimento,
    grupo: str,
    quantidade_original_g: float = 100.0,
) -> ResultadoSubstituicao:
    """
    Calcula a substituição ideal entre dois alimentos do mesmo grupo.

    Args:
        alimento_original: Dados nutricionais do alimento original
        alimento_substituto: Dados nutricionais do alimento substituto
        grupo: Grupo nutricional dos alimentos
        quantidade_original_g: Quantidade do alimento original em gramas

    Returns:
        ResultadoSubstituicao com a quantidade equivalente calculada
    """
    # Obter dados do grupo
    dados_grupo = GRUPOS_NUTRICIONAIS.get(grupo, {})
    macro_preponderante = dados_grupo.get("macronutriente_preponderante")

    if not macro_preponderante:
        # Casos Especiais sem grupo definido na lista
        if grupo == "iogurtes":
             macro_preponderante = "proteína"
        elif grupo == "agua_de_coco":
             macro_preponderante = "carboidrato"
        else:
            # Fallback: Detectar macro predominante no alimento original
            p, c, g = alimento_original.proteina_g, alimento_original.carboidrato_g, alimento_original.lipidios_g
            if c >= p and c >= g:
                macro_preponderante = "carboidrato"
            elif p >= c and p >= g:
                macro_preponderante = "proteína"
            else:
                macro_preponderante = "gordura"

    # Calcular valores do alimento original na quantidade especificada
    cal_original = (alimento_original.energia_kcal * quantidade_original_g) / 100
    ptn_original = (alimento_original.proteina_g * quantidade_original_g) / 100
    carb_original = (alimento_original.carboidrato_g * quantidade_original_g) / 100
    gord_original = (alimento_original.lipidios_g * quantidade_original_g) / 100

    # VALORES POR 100G DO SUBSTITUTO
    cal_substituto_100g = alimento_substituto.energia_kcal
    ptn_substituto_100g = alimento_substituto.proteina_g
    carb_substituto_100g = alimento_substituto.carboidrato_g
    gord_substituto_100g = alimento_substituto.lipidios_g

    # PASSO 1: Equalizar pelo macronutriente preponderante
    if macro_preponderante == "carboidrato":
        # Equalizar por CARBOIDRATOS
        if carb_substituto_100g > 0:
            equiv_g = (carb_original / carb_substituto_100g) * 100
        else:
            equiv_g = (cal_original / cal_substituto_100g) * 100

    elif macro_preponderante == "proteína":
        # Equalizar por PROTEÍNAS
        if ptn_substituto_100g > 0:
            equiv_g = (ptn_original / ptn_substituto_100g) * 100
        else:
            equiv_g = (cal_original / cal_substituto_100g) * 100

    elif macro_preponderante == "gordura":
        # Equalizar por GORDURAS
        if gord_substituto_100g > 0:
            equiv_g = (gord_original / gord_substituto_100g) * 100
        else:
            equiv_g = (cal_original / cal_substituto_100g) * 100

    else:
        # Calorias (padrão para grupos de baixa caloria)
        equiv_g = (cal_original / cal_substituto_100g) * 100

    # Calcular calorias resultantes
    cal_calculada = (cal_substituto_100g * equiv_g) / 100

    # PASSO 2: Validar diferença calórica (Apenas informativo, não corrige mais para dar prioridade ao macro)
    diferenca_cal = abs(cal_calculada - cal_original)

    # if diferenca_cal > 30:
    #     # Se diferença > 30 kcal, ajustar para equalizar calorias
    #     equiv_g = (cal_original / cal_substituto_100g) * 100
    #     cal_calculada = (cal_substituto_100g * equiv_g) / 100
    #     diferenca_cal = abs(cal_calculada - cal_original)

    # Arredondar para 1 casa decimal
    equiv_g = round(equiv_g, 1)
    diferenca_cal = round(diferenca_cal, 1)
    cal_calculada = round(cal_calculada, 1)

    return ResultadoSubstituicao(
        alimento_original=alimento_original.nome,
        alimento_substituto=alimento_substituto.nome,
        quantidade_original_g=quantidade_original_g,
        quantidade_substituto_g=equiv_g,
        grupo=grupo,
        macronutriente_igualizado=macro_preponderante,
        calorias_original=round(cal_original, 1),
        calorias_substituto=cal_calculada,
        diferenca_calorica=diferenca_cal,
        calorias_por_100g_original=alimento_original.energia_kcal,
        calorias_por_100g_substituto=alimento_substituto.energia_kcal,
    )


def sugerir_substitucoes(
    alimento_original: NutricaoAlimento,
    lista_substitutos: List[NutricaoAlimento],
    quantidade_original_g: float = 100.0,
    limite_resultados: int = 10,
) -> List[ResultadoSubstituicao]:
    """
    Gera uma lista de substituições para um alimento.

    Args:
        alimento_original: Dados nutricionais do alimento original
        lista_substitutos: Lista de alimentos substitutos
        quantidade_original_g: Quantidade do alimento original em gramas
        limite_resultados: Número máximo de substituições a retornar

    Returns:
        Lista de ResultadoSubstituicao ordenada por menor diferença calórica
    """
    grupo = identificar_grupo_nutricional(alimento_original.nome)

    if not grupo:
        return []
    
    # REGRA ESPECIAL: Água de Coco -> SEM SUBSTITUIÇÕES (BLOQUEIO TOTAL)
    if grupo == "agua_de_coco":
        return []

    # REGRA ESPECIAL: Iogurtes -> SEM SUBSTITUIÇÕES (BLOQUEIO TOTAL A PEDIDO DO USUÁRIO)
    if grupo == "iogurtes":
        return []

    candidatos_validos = []

    for substituto in lista_substitutos:
        grupo_substituto = identificar_grupo_nutricional(substituto.nome)

        # Só sugere se for do mesmo grupo
        if grupo == grupo_substituto and substituto.nome != alimento_original.nome:
            resultado = calcular_substituicao(
                alimento_original, substituto, grupo, quantidade_original_g
            )
            resultados.append(resultado)

    # Ordenar por menor diferença calórica
    resultados.sort(key=lambda x: x.diferenca_calorica)

    return resultados[:limite_resultados]


def formatar_resultado(resultado: ResultadoSubstituicao) -> str:
    """
    Formata um resultado de substituição para exibição.

    Args:
        resultado: ResultadoSubstituicao a formatar

    Returns:
        String formatada
    """
    return (
        f"{resultado.alimento_original} {resultado.quantidade_original_g}g "
        f"({resultado.calorias_original} kcal) → "
        f"{resultado.alimento_substituto} {resultado.quantidade_substituto_g}g "
        f"({resultado.calorias_substituto} kcal)\n"
        f"   Grupo: {resultado.grupo} | "
        f"Macro: {resultado.macronutriente_igualizado} | "
        f"Dif: {resultado.diferenca_calorica} kcal"
    )


# =============================================================================
# FUNÇÕES AUXILIARES PARA INTEGRAÇÃO COM BANCO DE DADOS
# =============================================================================


def safe_val(v):
    """Converte valor para float tratando None com segurança"""
    try:
        if v is None:
            return 0.0
        return float(v)
    except (ValueError, TypeError):
        return 0.0


def alimento_taco_para_nutricao(alimento_taco) -> NutricaoAlimento:
    """Converte um objeto AlimentoTACO para NutricaoAlimento"""
    return NutricaoAlimento(
        nome=alimento_taco.nome,
        energia_kcal=safe_val(alimento_taco.energia_kcal),
        proteina_g=safe_val(alimento_taco.proteina_g),
        lipidios_g=safe_val(alimento_taco.lipidios_g),
        carboidrato_g=safe_val(alimento_taco.carboidrato_g),
        fibra_g=safe_val(alimento_taco.fibra_g),
        grupo=alimento_taco.grupo or "",
        fonte="TACO",
    )


def alimento_tbca_para_nutricao(alimento_tbca) -> NutricaoAlimento:
    """Converte um objeto AlimentoTBCA para NutricaoAlimento"""
    return NutricaoAlimento(
        nome=alimento_tbca.nome,
        energia_kcal=safe_val(alimento_tbca.energia_kcal),
        proteina_g=safe_val(alimento_tbca.proteina_g),
        lipidios_g=safe_val(alimento_tbca.lipidios_g),
        carboidrato_g=safe_val(alimento_tbca.carboidrato_g),
        fibra_g=safe_val(alimento_tbca.fibra_g),
        grupo=alimento_tbca.grupo or "",
        fonte="TBCA",
    )


def alimento_usda_para_nutricao(alimento_usda) -> NutricaoAlimento:
    """Converte um objeto AlimentoUSDA para NutricaoAlimento"""
    return NutricaoAlimento(
        nome=alimento_usda.nome,
        energia_kcal=safe_val(alimento_usda.energia_kcal),
        proteina_g=safe_val(alimento_usda.proteina_g),
        lipidios_g=safe_val(alimento_usda.lipidios_g),
        carboidrato_g=safe_val(alimento_usda.carboidrato_g),
        fibra_g=safe_val(alimento_usda.fibra_g),
        grupo=alimento_usda.categoria,
        fonte="USDA",
    )


# =============================================================================
# TESTES E EXEMPLOS
# =============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("SISTEMA DE SUBSTITUIÇÃO NUTRICIONAL - NUTRI 4.0")
    print("=" * 60)
    print()

    # EXEMPLO 1: Arroz → Batata doce
    print("EXEMPLO 1: ARROZ INTEGRAL → BATATA DOCE")
    print("-" * 60)
    arroz = NutricaoAlimento(
        nome="arroz, integral, cozido",
        energia_kcal=124,
        proteina_g=2.6,
        lipidios_g=0.9,
        carboidrato_g=25.8,
        fibra_g=1.8,
        grupo="Cereais",
        fonte="TACO",
    )

    batata_doce = NutricaoAlimento(
        nome="batata, doce, cozida",
        energia_kcal=77,
        proteina_g=1.4,
        lipidios_g=0.1,
        carboidrato_g=17.9,
        fibra_g=2.5,
        grupo="Tubérculos",
        fonte="TACO",
    )

    resultado1 = calcular_substituicao(
        arroz, batata_doce, "carboidratos_complexos", 100
    )
    print(formatar_resultado(resultado1))
    print()

    # EXEMPLO 2: Frango → Tilápia
    print("EXEMPLO 2: FRANGO PEITO → TILÁPIA")
    print("-" * 60)
    frango = NutricaoAlimento(
        nome="frango, peito, grelhado, sem pele",
        energia_kcal=165,
        proteina_g=31.0,
        lipidios_g=3.6,
        carboidrato_g=0.0,
        fibra_g=0.0,
        grupo="Carnes e ovos",
        fonte="TACO",
    )

    tilapia = NutricaoAlimento(
        nome="peixe, tilápia, grelhado",
        energia_kcal=96,
        proteina_g=20.0,
        lipidios_g=1.7,
        carboidrato_g=0.0,
        fibra_g=0.0,
        grupo="Peixes",
        fonte="TACO",
    )

    resultado2 = calcular_substituicao(frango, tilapia, "proteinas_animais_magras", 100)
    print(formatar_resultado(resultado2))
    print()

    # EXEMPLO 3: Identificar grupo
    print("EXEMPLO 3: IDENTIFICAÇÃO DE GRUPO")
    print("-" * 60)
    alimentos_teste = [
        "frango, peito, grelhado, sem pele",
        "arroz, integral, cozido",
        "batata, doce, cozida",
        "alface, crua",
        "feijão, preto, cozido",
        "banana, nanica, crua",
    ]

    for alimento in alimentos_teste:
        grupo = identificar_grupo_nutricional(alimento)
        print(f"{alimento:45} → {grupo}")
    print()

    print("=" * 60)
