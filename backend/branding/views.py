from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import UserBranding
from .serializers import UserBrandingSerializer
from django.core.exceptions import ValidationError
from django.conf import settings
import os


class UserBrandingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar configurações de branding do usuário.
    """
    queryset = UserBranding.objects.all()
    serializer_class = UserBrandingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Apenas o branding do usuário autenticado
        return UserBranding.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Garantir que o usuário só pode criar branding para si mesmo
        serializer.save(user=self.request.user)

    def get_object(self):
        # Garantir que o usuário só acesse o próprio branding
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        Acessar ou atualizar as configurações de branding do usuário autenticado.
        """
        user_branding, created = UserBranding.objects.get_or_create(
            user=request.user,
            defaults={
                'user': request.user,
                'primary_color': '#22c55e',  # Verde padrão
                'secondary_color': '#059669'  # Verde escuro padrão
            }
        )

        if request.method == 'GET':
            serializer = self.get_serializer(user_branding)
            return Response(serializer.data)

        elif request.method == 'PATCH':
            serializer = self.get_serializer(
                user_branding, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)