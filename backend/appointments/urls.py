from django.urls import path
from . import views

app_name = "appointments"

urlpatterns = [
    path("", views.calendar_view, name="list"),  # Agora o calendário é a view principal
    path("legacy-list/", views.appointment_list, name="legacy_list"), # Lista antiga movida
    path("calendar/", views.calendar_view, name="calendar"), # Mantendo por compatibilidade
    path("api/list/", views.appointment_api_list, name="api_list"),
    path("create/", views.appointment_create, name="create"),
    path("create/<int:patient_pk>/", views.appointment_create, name="create_for_patient"),
    path("<int:pk>/", views.appointment_detail, name="detail"),
]
