from django.urls import path
from . import views

app_name = "lab_exams"

urlpatterns = [
    path("upload/", views.upload_exam, name="upload"),
]
