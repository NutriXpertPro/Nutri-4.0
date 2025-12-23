import html
import re

def sanitize_string(value):
    """
    Sanitiza uma string removendo ou escapando caracteres potencialmente perigosos.
    """
    if not isinstance(value, str):
        return value

    # Remover HTML/XML tags potencialmente perigosas
    value = html.escape(value)

    # Remover caracteres especiais que possam ser usados para injeção
    value = re.sub(r'[<>"\']', '', value)

    # Garantir que não haja caracteres de controle perigosos
    value = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)

    return value.strip()