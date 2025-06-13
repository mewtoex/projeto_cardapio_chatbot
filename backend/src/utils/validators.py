# backend/src/utils/validators.py
import re

def validate_cpf(cpf: str) -> bool:
    """
    Valida um número de CPF.
    Remove caracteres não numéricos e verifica o formato e dígitos verificadores.
    """
    cpf = re.sub(r'[^0-9]', '', cpf) # Remove tudo que não for dígito

    if not cpf or len(cpf) != 11:
        return False

    # Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if len(set(cpf)) == 1:
        return False

    # Calcula o primeiro dígito verificador
    sum_digits = 0
    for i in range(9):
        sum_digits += int(cpf[i]) * (10 - i)
    first_verifier_digit = 11 - (sum_digits % 11)
    if first_verifier_digit > 9:
        first_verifier_digit = 0

    if first_verifier_digit != int(cpf[9]):
        return False

    # Calcula o segundo dígito verificador
    sum_digits = 0
    for i in range(10):
        sum_digits += int(cpf[i]) * (11 - i)
    second_verifier_digit = 11 - (sum_digits % 11)
    if second_verifier_digit > 9:
        second_verifier_digit = 0

    if second_verifier_digit != int(cpf[10]):
        return False

    return True

def validate_cnpj(cnpj: str) -> bool:
    """
    Valida um número de CNPJ.
    Remove caracteres não numéricos e verifica o formato e dígitos verificadores.
    """
    cnpj = re.sub(r'[^0-9]', '', cnpj) # Remove tudo que não for dígito

    if not cnpj or len(cnpj) != 14:
        return False

    # Verifica se todos os dígitos são iguais (ex: 11.111.111/0001-11)
    if len(set(cnpj)) == 1:
        return False

    # Calcula o primeiro dígito verificador
    sum_digits = 0
    multiplier = 5
    for i in range(12):
        sum_digits += int(cnpj[i]) * multiplier
        multiplier -= 1
        if multiplier == 1:
            multiplier = 9
    
    first_verifier_digit = 11 - (sum_digits % 11)
    if first_verifier_digit > 9:
        first_verifier_digit = 0

    if first_verifier_digit != int(cnpj[12]):
        return False

    # Calcula o segundo dígito verificador
    sum_digits = 0
    multiplier = 6
    for i in range(13):
        sum_digits += int(cnpj[i]) * multiplier
        multiplier -= 1
        if multiplier == 1:
            multiplier = 9
    
    second_verifier_digit = 11 - (sum_digits % 11)
    if second_verifier_digit > 9:
        second_verifier_digit = 0

    if second_verifier_digit != int(cnpj[13]):
        return False

    return True

def validate_cep(cep: str) -> bool:
    """
    Valida um número de CEP.
    Verifica se o formato é 8 dígitos numéricos.
    """
    cep = re.sub(r'[^0-9]', '', cep)
    return bool(re.fullmatch(r'\d{8}', cep))