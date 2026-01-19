from django.urls import path
from .views import AnamnesisGeneralViewSet, AnamnesisViewSet, AnamnesisTemplateViewSet, AnamnesisResponseViewSet

app_name = 'anamnesis'

urlpatterns = [
    # General Anamnesis (for the main endpoint)
    path('', AnamnesisGeneralViewSet.as_view({'get': 'list'}), name='anamnesis-list'),
    # Standard Anamnesis
    path('standard/', AnamnesisViewSet.as_view({'get': 'list', 'post': 'create'}), name='anamnesis-standard-list'),
    path('standard/evolution/', AnamnesisViewSet.as_view({'get': 'evolution'}), name='anamnesis-standard-evolution'),
    path('standard/<int:pk>/', AnamnesisViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='anamnesis-standard-detail'),
    # Templates
    path('templates/', AnamnesisTemplateViewSet.as_view({'get': 'list', 'post': 'create'}), name='anamnesis-template-list'),
    path('templates/<int:pk>/', AnamnesisTemplateViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='anamnesis-template-detail'),
    # Responses
    path('responses/', AnamnesisResponseViewSet.as_view({'get': 'list', 'post': 'create'}), name='anamnesis-response-list'),
    path('responses/<int:pk>/', AnamnesisResponseViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='anamnesis-response-detail'),
]

