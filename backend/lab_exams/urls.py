from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "lab_exams"

# Configurar o router para o ViewSet
router = DefaultRouter()
router.register(r'', views.LabExamViewSet, basename='labexam')

urlpatterns = [
    # URLs do ViewSet
    path('', include(router.urls)),
]
