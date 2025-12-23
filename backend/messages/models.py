from django.db import models
from django.conf import settings
from utils.sanitization import sanitize_string


class Conversation(models.Model):
    """
    Representa uma conversa entre múltiplos participantes.
    """
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="conversations", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        """
        Retorna uma representação em string da conversa.
        """
        return f"Conversa {self.id}"


class Message(models.Model):
    """
    Representa uma mensagem individual dentro de uma conversa.
    """
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False, db_index=True) # Adicionado para performance

    class Meta:
        ordering = ["timestamp"]

    def save(self, *args, **kwargs):
        """Sanitizar conteúdo da mensagem antes de salvar"""
        if self.content:
            self.content = sanitize_string(self.content)
        super().save(*args, **kwargs)

    def __str__(self):
        """
        Retorna uma representação em string da mensagem, incluindo o remetente
        e o horário.
        """
        return f"Mensagem de {self.sender.name} em {self.timestamp.strftime('%H:%M')}"
