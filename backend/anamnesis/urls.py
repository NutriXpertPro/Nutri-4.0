from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnamnesisViewSet, AnamnesisTemplateViewSet, AnamnesisResponseViewSet

router = DefaultRouter()

app_name = 'anamnesis'
router.register(r'standard', AnamnesisViewSet, basename='anamnesis-standard')
router.register(r'templates', AnamnesisTemplateViewSet, basename='anamnesis-template')
router.register(r'responses', AnamnesisResponseViewSet, basename='anamnesis-response')

urlpatterns = [
    path('', include(router.urls)),
]
