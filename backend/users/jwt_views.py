from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Substitui a view padrão para usar email em vez de username para login JWT
    """
    serializer_class = CustomTokenObtainPairSerializer