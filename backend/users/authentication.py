from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(BaseBackend):
    """
    Backend de autenticação personalizado que permite login com email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Verifica se o username é um email
        if username is None:
            username = kwargs.get('email')
        
        if username is None or password is None:
            return None

        try:
            # Tenta encontrar o usuário pelo email
            user = User.objects.get(email=username)
        except User.DoesNotExist:

            # Executa o mesmo número de operações de hash para evitar timing attacks
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            # Mais de um usuário com o mesmo email (não deveria acontecer com email único)
            return None

        # Verifica se a senha está correta e se o usuário pode ser autenticado
        if user.check_password(password) and self._user_can_authenticate(user):
            return user

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def _user_can_authenticate(self, user):
        """
        Verifica se o usuário pode ser autenticado.
        Este é um método auxiliar baseado no padrão encontrado no Django.
        """
        # O usuário deve estar ativo e não estar desativado
        return getattr(user, 'is_active', True)