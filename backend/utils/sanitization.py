import html
import re

def deep_unescape(value):
    """
    Decodifica entidades HTML recursivamente até que não restem mais entidades.
    Exemplo: &amp;#x27; -> &#x27; -> '
    """
    if not isinstance(value, str):
        return value
    
    prev = None
    curr = value
    # Limite de 5 iterações para evitar loops infinitos em casos bizarros
    for _ in range(5):
        prev = curr
        curr = html.unescape(curr)
        if curr == prev:
            break
    return curr

def sanitize_string(value):
    """
    Sanitiza uma string removendo ou escapando caracteres potencialmente perigosos.
    Garante que entidades HTML sejam totalmente limpas e retornadas como texto puro.
    """
    if not isinstance(value, str):
        return value

    # 1. Decodificar entidades HTML profundamente (ex: &amp;#x27; -> ')
    # Isso transforma qualquer lixo codificado em texto legível
    value = deep_unescape(value)

    # 2. Se o usuário digitou algo que contém entidades HTML residuais, limpamos de novo
    # mas aqui fazemos uma limpeza extra para casos onde o apóstrofo não é desejado
    # ou se ele foi inserido por erro de codificação.
    
    # 3. Remover apenas os caracteres realmente perigosos para injeção de scripts/HTML
    # Mantemos o apóstrofo (') se ele for REAL, mas se ele for &#x27; ele vira ' no passo 1.
    dangerous_chars = '<>"'
    for char in dangerous_chars:
        value = value.replace(char, '')
    
    # IMPORTANTE: Se o objetivo é NÃO ter símbolos especiais conforme o frontend valida,
    # vamos garantir que o backend também limpe símbolos que passarem.
    # Mas para o nome "Sant Ana", o que importa é que o espaço não vire entidade.
    
    return value.strip()