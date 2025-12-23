"""
URL configuration for setup project.
Django REST API - Arquitetura Headless
"""

from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from users.jwt_views import CustomTokenObtainPairView
from users.views import UserDetailView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", lambda request: JsonResponse({"message": "Nutri 4.0 API is running"}), name="root"),
    path("health/", lambda request: JsonResponse({"status": "healthy"}), name="health-check"),
    
    # API REST - Autenticação JWT (Tokens)
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    
    # Apps
    path("api/v1/auth/", include("users.urls", namespace="auth")),
    path("api/v1/users/me/", UserDetailView.as_view(), name="user-detail"),
    
    path("api/v1/patients/", include("patients.urls", namespace="patients")),
    path("api/v1/appointments/", include("appointments.urls", namespace="appointments")),
    path("api/v1/anamnesis/", include("anamnesis.urls", namespace="anamnesis")),
    path("api/v1/diets/", include("diets.urls", namespace="diets")),
    path("api/v1/evaluations/", include("evaluations.urls", namespace="evaluations")),
    path("api/v1/notifications/", include("notifications.urls", namespace="notification")),
    path("api/v1/messages/", include("messages.urls", namespace="messages")),
    path("api/v1/lab_exams/", include("lab_exams.urls", namespace="lab_exams")),
    path("api/v1/automation/", include("automation.urls", namespace="automation")),
    path("api/v1/branding/", include("branding.urls", namespace="branding")),
    path("api/v1/integrations/", include("integrations.urls", namespace="integrations")),
    path("api/v1/dashboard/", include("dashboard.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)