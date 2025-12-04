from django.urls import path
from . import views

app_name = "diets"

urlpatterns = [
    path("", views.plano_alimentar, name="plano_alimentar"),
    path("list/", views.diet_list, name="list"),
    path("create/", views.diet_create, name="create"),
    path("create/<int:patient_pk>/", views.diet_create, name="create_for_patient"),
    
    # New Advanced System
    path("create-advanced/", views.create_diet_view, name="create_advanced"),
    path("api/foods/", views.get_food_database, name="api_foods"),
    
    path("<int:pk>/", views.diet_detail, name="detail"),
    path("<int:pk>/details/", views.diet_detail_modal, name="detail_modal"),
    
    # AJAX Endpoints
    path("buscar-alimentos/", views.buscar_alimentos, name="buscar_alimentos"),
    path("calcular-necessidades/", views.calcular_necessidades, name="calcular_necessidades"),
    path("gerar-cardapio-ia/", views.gerar_cardapio_ia, name="gerar_cardapio_ia"),
    path("gerar-substituicoes/", views.gerar_substituicoes, name="gerar_substituicoes"),
    
    # Custom Foods Endpoints
    path("alimentos/criar/", views.criar_alimento_customizado, name="criar_alimento"),
    path("alimentos/<int:alimento_id>/editar/", views.editar_alimento_customizado, name="editar_alimento"),
    path("alimentos/<int:alimento_id>/deletar/", views.deletar_alimento_customizado, name="deletar_alimento"),
    
    # PDF Generation
    path("pdf/<int:patient_id>/", views.gerar_pdf, name="gerar_pdf"),
]

