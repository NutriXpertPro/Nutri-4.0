from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from automation.tasks import send_new_message_notifications

class ConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar conversas.
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter conversations where the user is a participant
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages')

    def perform_create(self, serializer):
        conversation = serializer.save()
        # Add the current user to the conversation
        conversation.participants.add(self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar mensagens.
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter messages from conversations where the user is a participant
        return Message.objects.filter(
            conversation__participants=self.request.user
        ).select_related('sender', 'conversation')

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        # Chamar a tarefa Celery para enviar notificações de nova mensagem
        send_new_message_notifications.delay(message.id)

    @action(detail=False, methods=['get'])
    def inbox(self, request):
        """
        Action para listar conversas com novas mensagens.
        """
        return inbox_view(request)


# View separada para o endpoint inbox
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inbox_view(request):
    """
    View para listar conversas com novas mensagens.
    """
    conversations = Conversation.objects.filter(
        participants=request.user
    ).prefetch_related('participants', 'messages').order_by('-updated_at')

    # Verificar se há mensagens não lidas em cada conversa
    data = []
    for conv in conversations:
        last_message = conv.messages.last()
        unread_count = conv.messages.filter(is_read=False).exclude(sender=request.user).count()
        data.append({
            'id': conv.id,
            'participants': [p.name for p in conv.participants.exclude(id=request.user.id)],
            'last_message': last_message.content if last_message else '',
            'last_message_time': last_message.timestamp if last_message else None,
            'unread_count': unread_count,
        })

    return Response(data)
