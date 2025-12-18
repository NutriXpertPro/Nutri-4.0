from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from .models import Notification, NotificationSettings
from .serializers import NotificationSerializer, NotificationSettingsSerializer
from messages.models import Message, Conversation

class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar notificações.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter notifications for the logged-in user
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """
        Action para marcar notificação como lida.
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """
        Action para marcar todas as notificações como lidas.
        """
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True, sent_at=timezone.now())
        return Response({"message": f"{notifications.count()} notificações marcadas como lidas."})


    @action(detail=False, methods=['get'])
    def urgent_messages_count(self, request):
        """
        Action para obter a contagem de mensagens não respondidas há mais de 24h.
        """
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Q

        # Obter o horário de 24h atrás
        time_24h_ago = timezone.now() - timedelta(hours=24)

        # Obter conversas onde o usuário participa
        user_conversations = Conversation.objects.filter(participants=request.user)

        # Contar mensagens não lidas criadas há mais de 24h
        # e que não foram respondidas (ou seja, não há mensagens mais recentes na conversa)
        urgent_messages_count = 0

        for conversation in user_conversations:
            # Obter mensagens da conversa que são mais antigas que 24h e não lidas
            old_unread_messages = conversation.messages.filter(
                timestamp__lt=time_24h_ago,
                is_read=False
            ).exclude(sender=request.user)  # Excluir mensagens enviadas pelo próprio usuário

            for message in old_unread_messages:
                # Verificar se há alguma resposta após essa mensagem (ou seja, foi respondida)
                responses = conversation.messages.filter(
                    timestamp__gt=message.timestamp
                )
                if not responses.exists():
                    # Se não houver respostas, é uma mensagem não respondida há mais de 24h
                    urgent_messages_count += 1

        return Response({"urgent_messages_count": urgent_messages_count})


class NotificationSettingsView(APIView):
    """
    View para gerenciar as configurações de notificação do usuário.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Obtém ou cria as configurações de notificação para o usuário
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user
        )
        return settings

    def get(self, request):
        """
        Retorna as configurações de notificação do usuário.
        """
        settings = self.get_object()
        serializer = NotificationSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        """
        Atualiza as configurações de notificação do usuário.
        """
        settings = self.get_object()
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
