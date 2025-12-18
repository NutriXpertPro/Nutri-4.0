from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "automation"

# Configurar o router para o ViewSet
router = DefaultRouter()
router.register(r'templates', views.AutomationTemplateViewSet, basename='automation-template')

urlpatterns = [
    # URLs dos ViewSets
    path('', include(router.urls)),
]