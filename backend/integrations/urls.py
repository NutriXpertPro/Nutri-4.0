from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoogleCalendarAuthView, GoogleCalendarCallbackView, GoogleCalendarSyncViewSet

app_name = "integrations"

# Configurar o router para o ViewSet
router = DefaultRouter()
router.register(r'google-calendar/sync', GoogleCalendarSyncViewSet, basename='google-calendar-sync')

urlpatterns = [
    # URLs do ViewSet
    path('', include(router.urls)),
    
    # URLs de autenticação
    path('google-calendar/auth/', GoogleCalendarAuthView.as_view(), name='google-calendar-auth'),
    path('google-calendar/callback/', GoogleCalendarCallbackView.as_view(), name='google-calendar-callback'),
]