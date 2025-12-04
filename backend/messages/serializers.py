from rest_framework import serializers
from .models import Conversation, Message
from users.models import User  # Importar o modelo User customizado


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "name", "email", "professional_title", "gender"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    # Adicionar um campo para o ID do remetente para criação
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source="sender", write_only=True
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "sender_id",
            "content",
            "timestamp",
            "is_read",
        ]
        read_only_fields = ["sender", "timestamp"]


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    # Adicionar um campo para IDs dos participantes para criação/atualização
    participant_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, source="participants", write_only=True
    )

    class Meta:
        model = Conversation
        fields = [
            "id",
            "participants",
            "participant_ids",
            "created_at",
            "updated_at",
            "messages",
        ]
        read_only_fields = ["created_at", "updated_at"]
