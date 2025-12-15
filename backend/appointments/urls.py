from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "appointments"

# Configurar o router para o ViewSet
router = DefaultRouter()
router.register(r'', views.AppointmentViewSet, basename='appointment')

urlpatterns = [
    # URLs do ViewSet
    path('', include(router.urls)),
    # Endpoint específico para calendário
    path('calendar/', views.calendar_view, name='calendar'),
    # Endpoint para horários disponíveis
    path('available-slots/<int:patient_id>/', views.available_slots, name='available-slots'),
]
