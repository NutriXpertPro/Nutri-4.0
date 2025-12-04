from django.contrib import admin
from .models import PatientProfile

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'nutritionist', 'birth_date', 'phone', 'goal', 'service_type', 'created_at')
    list_filter = ('nutritionist', 'goal', 'service_type')
    search_fields = ('user__name', 'user__email', 'phone')
    readonly_fields = ('created_at',)
