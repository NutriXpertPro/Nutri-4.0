"""
URL configuration for setup project.
Django REST API - Arquitetura Headless
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # API REST - Autenticação JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    # Apps
    path("users/", include("users.urls", namespace="users")),
    path("patients/", include("patients.urls", namespace="patients")),
    path("appointments/", include("appointments.urls", namespace="appointments")),
    path("anamnesis/", include("anamnesis.urls", namespace="anamnesis")),
    path("diets/", include("diets.urls", namespace="diets")),
    path("evaluations/", include("evaluations.urls", namespace="evaluations")),
    path("api/notifications/", include("notifications.urls", namespace="notification")),
    path("messages/", include("messages.urls", namespace="messages")),
    path("lab_exams/", include("lab_exams.urls", namespace="lab_exams")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
