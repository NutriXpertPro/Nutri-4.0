"""
URL configuration for config project.

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
from users import views as user_views
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'Nutri 4.0 API is running'
    })

urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('users.urls')),
    path('api/v1/users/me/', user_views.UserDetailView.as_view(), name='user-me'),
    path('api/v1/users/me/change-password/', user_views.ChangePasswordView.as_view(), name='user-change-password'),
    path('api/v1/patients/', include('patients.urls')),
    path('api/v1/appointments/', include('appointments.urls')),
    path('api/v1/anamnesis/', include('anamnesis.urls')),
    path('api/v1/evaluations/', include('evaluations.urls')),
    path('api/v1/lab-exams/', include('lab_exams.urls')),
    path('api/v1/messages/', include('messages.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/diets/', include('diets.urls')),  # Foods and Diets
    path('api/v1/', include('dashboard.urls')),
]
