from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "messages"

# Configurar os routers para os ViewSets
router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversation')
router.register(r'messages', views.MessageViewSet, basename='message')

urlpatterns = [
    # URLs dos ViewSets
    path('', include(router.urls)),
    # Endpoint manual para inbox
    path('inbox/', views.inbox_view, name='message-inbox'),
]
