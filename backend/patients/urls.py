from django.urls import path
from . import views

app_name = "patients"

urlpatterns = [
    path("", views.PatientListView.as_view(), name="list_create"),
    path("search/", views.patient_search_view, name="patient-search"),
    path("<int:pk>/", views.PatientDetailView.as_view(), name="detail_update_delete"),
    path("<int:pk>/compare_photos/", views.compare_photos_view, name="compare_photos"),
]
