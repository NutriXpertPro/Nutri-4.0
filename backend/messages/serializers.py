from rest_framework import serializers
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    participants_names = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'participants_names', 'created_at', 'updated_at', 'last_message']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_participants(self, obj):
        participants_data = []
        request = self.context.get('request')
        for user in obj.participants.all():
            avatar_url = None
            if hasattr(user, 'profile') and user.profile.profile_picture:
                try:
                    if request:
                        avatar_url = request.build_absolute_uri(user.profile.profile_picture.url)
                    else:
                        avatar_url = user.profile.profile_picture.url
                except:
                    pass
            
            participants_data.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'avatar': avatar_url,
                'professional_title': user.get_professional_title_display(),
                'user_type': user.user_type
            })
        return participants_data

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