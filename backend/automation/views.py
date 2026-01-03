from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import AutomationTemplate
from .serializers import AutomationTemplateSerializer


class AutomationTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar templates de automação de mensagens.
    """
    queryset = AutomationTemplate.objects.all()
    serializer_class = AutomationTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'trigger']

    def get_queryset(self):
        # Apenas templates do usuário autenticado
        return AutomationTemplate.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        # Associar o template ao usuário autenticado
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        # Manter o usuário original ao atualizar
        serializer.save()