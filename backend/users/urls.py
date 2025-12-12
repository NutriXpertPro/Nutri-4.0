from django.urls import path
from . import views
from .jwt_views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

app_name = "users"

urlpatterns = [
    # JWT endpoints
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    # Traditional endpoints
    path("login/nutricionista/", views.nutricionista_login_view, name="nutricionista_login"),
    path("login/paciente/", views.paciente_login_view, name="patient_login"),
    path("register/nutricionista/", views.nutricionista_register_view, name="nutricionista_register"),
    path("register/paciente/", views.paciente_register_view, name="cadastro_paciente"),
    path("google/", views.google_login_view, name="google_login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("password-reset/", views.PasswordResetView.as_view(), name="password_reset"),
    path("password-reset/confirm/<uidb64>/<token>/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("log/", views.AuthenticationLogView.as_view(), name="auth_log"),
]

