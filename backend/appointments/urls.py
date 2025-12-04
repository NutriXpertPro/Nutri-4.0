from django.urls import path
from . import views

app_name = "appointments"

urlpatterns = [
    path("", views.appointment_list, name="list"),
    path("create/", views.appointment_create, name="create"),
    path("<int:pk>/", views.appointment_detail, name="detail"),
    path("calendar/", views.calendar_view, name="calendar"),
]
