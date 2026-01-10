from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from automation.tasks import send_new_message_notifications
from patients.models import PatientProfile

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

    @action(detail=False, methods=['post'], url_path='find-or-create-by-patient')
    def find_or_create_by_patient(self, request):
        """
        Encontra ou cria uma conversa com um paciente usando o patient_profile_id.
        Converte automaticamente para o user_id correto.
        """
        patient_id = request.data.get('patient_id')
        
        if not patient_id:
            return Response(
                {'error': 'patient_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Buscar o PatientProfile e obter o user_id associado
            patient_profile = PatientProfile.objects.get(id=patient_id)
            patient_user = patient_profile.user
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Paciente não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Buscar uma conversa existente entre o nutricionista e o paciente
        existing_conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=patient_user
        ).first()
        
        if existing_conversation:
            serializer = self.get_serializer(existing_conversation)
            return Response(serializer.data)
        
        # Criar uma nova conversa
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, patient_user)
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='mark-all-as-read')
    def mark_all_as_read(self, request, pk=None):
        """
        Marca todas as mensagens da conversa como lidas para o usuário atual.
        """
        conversation = self.get_object()
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'messages marked as read'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='clear-messages')
    def clear_messages(self, request, pk=None):
        """
        Deleta todas as mensagens de uma conversa específica.
        """
        conversation = self.get_object()
        conversation.messages.all().delete()
        
        # Atualizar o updated_at da conversa
        conversation.save()
        
        return Response({'status': 'messages cleared'}, status=status.HTTP_200_OK)


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
        # Construir lista de participantes com avatar
        participants_data = []
        for p in conv.participants.all():
            # SEGURANÇA: Se sou paciente, não devo ver outros pacientes
            if request.user.user_type == 'paciente' and p.user_type == 'paciente' and p.id != request.user.id:
                continue

            avatar_url = None
            if hasattr(p, 'profile') and p.profile.profile_picture:
                try:
                    avatar_url = request.build_absolute_uri(p.profile.profile_picture.url)
                except:
                    pass
            participants_data.append({
                'id': p.id,
                'name': p.name,
                'email': p.email,
                'avatar': avatar_url,
                'professional_title': p.get_professional_title_display(),
                'user_type': p.user_type
            })

        data.append({
            'id': conv.id,
            'participants': participants_data,
            'last_message': last_message.content if last_message else '',
            'last_message_time': last_message.timestamp if last_message else None,
            'unread_count': unread_count,
        })

    return Response(data)
