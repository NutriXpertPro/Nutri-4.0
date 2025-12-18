from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_diary import PatientDiaryEntryViewSet, SocialCommentViewSet, CommunityFeedViewSet

app_name = "patients"

# Configurar o router para o diário e comunidade
diary_router = DefaultRouter()
diary_router.register(r'diary-entries', PatientDiaryEntryViewSet, basename='patient-diary-entry')
diary_router.register(r'comments', SocialCommentViewSet, basename='social-comment')
diary_router.register(r'community', CommunityFeedViewSet, basename='community-feed')

urlpatterns = [
    # URLs tradicionais de pacientes
    path("", views.PatientListView.as_view(), name="list_create"),
    path("search/", views.patient_search_view, name="patient-search"),
    path("<int:pk>/", views.PatientDetailView.as_view(), name="detail_update_delete"),
    path("<int:pk>/compare_photos/", views.compare_photos_view, name="compare_photos"),

    # URLs do diário e comunidade
    path('diary/', include(diary_router.urls)),
]
