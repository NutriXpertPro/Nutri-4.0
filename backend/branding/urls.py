from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "branding"

# Configurar o router para o ViewSet
router = DefaultRouter()
router.register(r'branding', views.UserBrandingViewSet, basename='user-branding')

urlpatterns = [
    # URLs dos ViewSets
    path('', include(router.urls)),
]