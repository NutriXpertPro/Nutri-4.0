from django.urls import path
from . import views

app_name = "patients"

urlpatterns = [
    path("", views.patient_list, name="list"),
    path("create/", views.patient_create, name="create"),
    path("<int:pk>/", views.patient_detail, name="detail"),
    path("<int:pk>/edit/", views.patient_edit, name="edit"),
    path("<int:pk>/compare_photos/", views.compare_photos_view, name="compare_photos"),
]
