from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer


from rest_framework.decorators import action
from rest_framework.response import Response


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite que notificações sejam visualizadas.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retorna uma lista de todas as notificações não lidas para o usuário
        autenticado atualmente.
        """
        return Notification.objects.filter(
            user=self.request.user, is_read=False
        ).order_by("-sent_at")

    @action(detail=False, methods=["post"])
    def mark_all_as_read(self, request):
        """
        Marca todas as notificações não lidas do usuário como lidas.
        """
        unread_notifications = self.get_queryset().filter(is_read=False)
        unread_notifications.update(is_read=True)
        return Response({"status": "all notifications marked as read"})


@login_required
def unread_notifications_htmx(request):
    """
    Renderiza um fragmento HTML com as últimas 5 notificações não lidas
    do usuário, para ser usado com HTMX.
    """
    notifications = Notification.objects.filter(
        user=request.user, is_read=False
    ).order_by("-sent_at")[
        :5
    ]  # Get latest 5 unread notifications
    serializer = NotificationSerializer(notifications, many=True)
    return render(
        request,
        "notifications/_unread_notifications.html",
        {"notifications": serializer.data},
    )
