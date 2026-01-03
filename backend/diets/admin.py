from django.contrib import admin
from .models import Diet, AlimentoTACO, AlimentoTBCA, AlimentoUSDA, DefaultPreset

@admin.register(Diet)
class DietAdmin(admin.ModelAdmin):
    list_display = ('name', 'patient', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'patient__user__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(AlimentoTACO)
class AlimentoTACOAdmin(admin.ModelAdmin):
    list_display = ('nome', 'grupo', 'energia_kcal', 'proteina_g', 'carboidrato_g', 'lipidios_g')
    list_filter = ('grupo',)
    search_fields = ('nome', 'grupo')

@admin.register(AlimentoTBCA)
class AlimentoTBCAAdmin(admin.ModelAdmin):
    list_display = ('nome', 'grupo', 'energia_kcal', 'proteina_g', 'carboidrato_g', 'lipidios_g')
    list_filter = ('grupo',)
    search_fields = ('nome', 'grupo', 'codigo')

@admin.register(AlimentoUSDA)
class AlimentoUSDAAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'energia_kcal', 'proteina_g', 'carboidrato_g', 'lipidios_g')
    list_filter = ('categoria',)
    search_fields = ('nome', 'categoria', 'fdc_id')


@admin.register(DefaultPreset)
class DefaultPresetAdmin(admin.ModelAdmin):
    list_display = ('nutritionist', 'meal_type', 'diet_type', 'preset', 'is_active', 'created_at')
    list_filter = ('meal_type', 'diet_type', 'is_active', 'created_at')
    search_fields = ('nutritionist__name', 'nutritionist__email', 'preset__name')
    readonly_fields = ('created_at', 'updated_at')
