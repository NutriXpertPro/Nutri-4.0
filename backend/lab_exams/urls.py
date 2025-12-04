from django.urls import path
from . import views

app_name = "lab_exams"

urlpatterns = [
    path('upload/patient/<int:patient_pk>/', views.lab_exam_upload, name='lab_exam_upload'),
]
