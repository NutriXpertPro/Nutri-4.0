from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer

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
