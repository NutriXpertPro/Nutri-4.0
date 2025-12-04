from django.contrib import admin
from .models import Notification

# Register your models here.


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "type", "message", "is_read", "sent_at")
    list_filter = ("type", "is_read", "sent_at")
    search_fields = ("user__email", "message")
    readonly_fields = ("user", "type", "message", "sent_at")

    def has_add_permission(self, request):
        # Ninguém deve poder adicionar notificações manualmente pelo admin
        return False

    def has_delete_permission(self, request, obj=None):
        # É uma boa ideia manter um registro de todas as notificações
        return False
