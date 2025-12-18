from django.contrib import admin
from .models import Notification

# Register your models here.


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "notification_type", "message", "is_read", "created_at")
    list_filter = ("notification_type", "is_read", "created_at")
    search_fields = ("user__email", "message")
    readonly_fields = ("user", "title", "message", "notification_type", "created_at", "sent_at")

    def has_add_permission(self, request):
        # Ninguém deve poder adicionar notificações manualmente pelo admin
        return False

    def has_delete_permission(self, request, obj=None):
        # É uma boa ideia manter um registro de todas as notificações
        return False
