from django.contrib import admin
from .models import Payment

# Register your models here.


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "amount", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("patient__name", "asaas_id")
    list_per_page = 25
