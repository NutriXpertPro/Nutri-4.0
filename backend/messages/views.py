from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite que conversas sejam visualizadas ou editadas.
    """
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retorna conversas onde o usuário logado é um participante.
        """
        # Retorna conversas onde o usuário logado é um participante
        return Conversation.objects.filter(participants=self.request.user).prefetch_related('participants').order_by( # Adicionado prefetch_related
            "-updated_at"
        )

    def perform_create(self, serializer):
        """
        Garante que o usuário logado seja um participante da conversa
        ao criar uma nova.
        """
        # Garante que o usuário logado seja um participante da conversa
        conversation = serializer.save()
        conversation.participants.add(self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite que mensagens sejam visualizadas ou editadas.
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retorna mensagens de conversas onde o usuário logado é um participante.
        """
        # Retorna mensagens de conversas onde o usuário logado é um participante
        conversation_id = self.kwargs["conversation_pk"]  # Obtido da URL aninhada
        return Message.objects.filter(
            conversation__id=conversation_id,
            conversation__participants=self.request.user,
        ).select_related('sender', 'conversation').order_by("timestamp") # Adicionado select_related

    def perform_create(self, serializer):
        """
        Garante que o remetente da mensagem seja o usuário logado e associa
        a mensagem à conversa correta.
        """
        # Garante que o remetente da mensagem seja o usuário logado
        conversation_id = self.kwargs["conversation_pk"]
        conversation = Conversation.objects.select_related('participants').get(id=conversation_id) # Adicionado select_related
        serializer.save(sender=self.request.user, conversation=conversation)

    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None, conversation_pk=None):
        """
        Marca uma mensagem específica como lida.
        """
        message = self.get_object()
        # Otimizado: o get_object já deve ter carregado a conversa se o serializer precisar
        # Se message.conversation for acessado, o select_related no get_queryset do MessageViewSet já ajuda
        if message.conversation.participants.filter(id=request.user.id).exists():
            message.is_read = True
            message.save()
            return Response({"status": "all messages marked as read"})
        return Response(
            {"detail": "Not authorized to mark this message as read"},
            status=status.HTTP_403_FORBIDDEN,
        )


@login_required
def inbox_view(request):
    """
    Renderiza a página da caixa de entrada de mensagens.
    """
    return render(request, "messages/inbox.html", {})
