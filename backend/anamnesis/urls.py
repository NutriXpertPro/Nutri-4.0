from django.urls import path
from .views import AnamnesisViewSet, AnamnesisTemplateViewSet, AnamnesisResponseViewSet

app_name = 'anamnesis'

urlpatterns = [
    # Standard Anamnesis
    path('standard/', AnamnesisViewSet.as_view({'get': 'list', 'post': 'create'}), name='anamnesis-standard-list'),
    path('standard/<int:pk>/', AnamnesisViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='anamnesis-standard-detail'),
    # Templates
    path('templates/', AnamnesisTemplateViewSet.as_view({'get': 'list', 'post': 'create'}), name='anamnesis-template-list'),
    path('templates/<int:pk>/', AnamnesisTemplateViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='anamnesis-template-detail'),
    # Responses
    path('responses/', AnamnesisResponseViewSet.as_view({'get': 'list', 'post': 'create'}), name='anamnesis-response-list'),
    path('responses/<int:pk>/', AnamnesisResponseViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='anamnesis-response-detail'),
]

