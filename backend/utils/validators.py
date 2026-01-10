import re
from django.core.exceptions import ValidationError

def validate_cpf(cpf):
    """
    Validates a CPF number matching the Brazilian standard.
    """
    # Remove characters that are not digits
    cpf = ''.join(filter(str.isdigit, cpf))

    # Check length
    if len(cpf) != 11:
        raise ValidationError('CPF deve conter 11 dígitos.')

    # Check for repeated digits (e.g., 111.111.111-11)
    if cpf == cpf[0] * 11:
        raise ValidationError('CPF inválido.')

    # Calculate first verifying digit
    sum_ = 0
    weight = 10
    for i in range(9):
        sum_ += int(cpf[i]) * weight
        weight -= 1
    
    remainder = sum_ % 11
    if remainder < 2:
        digit1 = 0
    else:
        digit1 = 11 - remainder

    if int(cpf[9]) != digit1:
        raise ValidationError('CPF inválido.')

    # Calculate second verifying digit
    sum_ = 0
    weight = 11
    for i in range(10):
        sum_ += int(cpf[i]) * weight
        weight -= 1
        
    remainder = sum_ % 11
    if remainder < 2:
        digit2 = 0
    else:
        digit2 = 11 - remainder

    if int(cpf[10]) != digit2:
        raise ValidationError('CPF inválido.')

    return cpf
