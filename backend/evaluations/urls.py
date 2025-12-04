from django.urls import path
from . import views

app_name = "evaluations"

urlpatterns = [
    path("", views.evaluation_list, name="list"),
    path("create/", views.evaluation_create, name="create"),
    path("<int:pk>/partial/", views.evaluation_details_partial, name="detail_partial"),
]
