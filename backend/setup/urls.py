"""
URL configuration for setup project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("users/", include("users.urls", namespace="users")),
    path("patients/", include("patients.urls", namespace="patients")),
    path("appointments/", include("appointments.urls", namespace="appointments")),
    path("anamnesis/", include("anamnesis.urls", namespace="anamnesis")),
    path("diets/", include("diets.urls", namespace="diets")),
    path("evaluations/", include("evaluations.urls", namespace="evaluations")),
    path("api/", include("notifications.urls", namespace="notification")),
    path("messages/", include("messages.urls", namespace="messages")),
    path("lab_exams/", include("lab_exams.urls", namespace="lab_exams")),
    path("", include("theme.urls", namespace="theme")),
    path("admin/", admin.site.urls),
    path("django-browser-reload/", include("django_browser_reload.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
