from django.urls import path
from . import views

app_name = "anamnesis"

urlpatterns = [
    path('', views.anamnesis_list, name='list'),
    path('form/', views.anamnesis_form, name='form'),
    path('form/<int:patient_id>/', views.anamnesis_form, name='form_edit'),
    path('submit/', views.anamnesis_submit, name='submit'),
    path('patient/<int:patient_id>/restrictions/', views.get_patient_restrictions, name='patient_restrictions'),
]
