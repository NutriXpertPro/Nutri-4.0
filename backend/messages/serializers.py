from rest_framework import serializers
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    participants_names = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'participants_names', 'created_at', 'updated_at', 'last_message']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_participants_names(self, obj):
        return [p.name for p in obj.participants.all()]
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content,
                'sender': last_msg.sender.name,
                'timestamp': last_msg.timestamp
            }
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    conversation_participants = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'content', 'timestamp', 'is_read', 'conversation_participants']
        read_only_fields = ['id', 'timestamp', 'sender', 'conversation_participants']
    
    def get_conversation_participants(self, obj):
        return [p.name for p in obj.conversation.participants.exclude(id=obj.sender.id)]