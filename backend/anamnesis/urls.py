from django.urls import path
from . import views

app_name = "anamnesis"

urlpatterns = [
    path("", views.anamnesis_list, name="list"),
    path("form/", views.anamnesis_form, name="form"),
    path("form/<int:pk>/", views.anamnesis_form, name="form_edit"),
]
