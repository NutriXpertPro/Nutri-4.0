from rest_framework.throttling import AnonRateThrottle

class AuthRateThrottle(AnonRateThrottle):
    """
    Rate limit específico para endpoints de autenticação.
    Limita a 5 tentativas por minuto por IP.
    """
    scope = 'auth'
