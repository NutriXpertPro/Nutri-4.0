from django.contrib import admin
from django.utils.html import format_html # Importar format_html
from .models import Evaluation, EvaluationPhoto

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'date', 'method', 'weight', 'body_fat', 'muscle_mass')
    list_filter = ('method', 'date')
    search_fields = ('patient__user__name',)
    readonly_fields = ('created_at',)

@admin.register(EvaluationPhoto)
class EvaluationPhotoAdmin(admin.ModelAdmin):
    list_display = ('evaluation', 'label', 'image_tag') # Alterado 'photo_type' para 'label'
    readonly_fields = ('image_tag',)

    def image_tag(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width:100px; max-height:100px;" />'.format(obj.image.url))
        return "No Image"
    image_tag.short_description = 'Image'
