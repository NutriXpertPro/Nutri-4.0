from django.urls import path
from . import views

app_name = "evaluations"

urlpatterns = [
    path("", views.evaluation_list, name="list"),
    path("create/<int:patient_pk>/", views.evaluation_create, name="create_for_patient"),
    path('<int:pk>/details/', views.evaluation_detail_modal, name='detail_modal'),
]
