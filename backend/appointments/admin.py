from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):


    fieldsets = (
        (None, {
            'fields': ('user', 'patient', 'date')
        }),
        ('Detalhes Adicionais', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
