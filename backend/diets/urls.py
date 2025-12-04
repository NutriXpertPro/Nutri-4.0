from django.urls import path
from . import views

app_name = "diets"

urlpatterns = [
    path("", views.diet_list, name="list"),
    path("create/", views.diet_create, name="create"),
    path("<int:pk>/", views.diet_detail, name="detail"),
    path("<int:pk>/partial/", views.diet_details_partial, name="detail_partial"),
    path("plano-alimentar/", views.plano_alimentar_view, name="plano_alimentar"),
]
