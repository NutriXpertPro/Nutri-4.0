from django.urls import path
from . import views

app_name = "diets"

urlpatterns = [
    # Food search
    path('foods/', views.FoodSearchViewSet.as_view({'get': 'list'}), name='food-list'),
    path('foods/grupos/', views.FoodSearchViewSet.as_view({'get': 'grupos'}), name='food-grupos'),
    path('toggle-favorite/', views.ToggleFavoriteView.as_view(), name='toggle-favorite'),
    # Diet CRUD
    path('diets/', views.DietViewSet.as_view({'get': 'list', 'post': 'create'}), name='diet-list'),
    path('diets/<int:pk>/', views.DietViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='diet-detail'),
    # Meals
    path('meals/', views.MealViewSet.as_view({'get': 'list', 'post': 'create'}), name='meal-list'),
    path('meals/<int:pk>/', views.MealViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='meal-detail'),
    # Food Items
    path('food-items/', views.FoodItemViewSet.as_view({'get': 'list', 'post': 'create'}), name='fooditem-list'),
    path('food-items/<int:pk>/', views.FoodItemViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='fooditem-detail'),
]

