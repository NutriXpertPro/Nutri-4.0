from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "notifications"

# Configurar o router para o ViewSet
router = DefaultRouter()
router.register(r'', views.NotificationViewSet, basename='notification')

urlpatterns = [
    # URLs do ViewSet
    path('', include(router.urls)),
    # Rota específica para as configurações de notificação
    path('settings/', views.NotificationSettingsView.as_view(), name='notification-settings'),
]
