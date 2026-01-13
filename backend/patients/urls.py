from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_diary import PatientDiaryEntryViewSet, SocialCommentViewSet, CommunityFeedViewSet
from .views_patient_data import (
    PatientMetricsViewSet,
    PatientMealsViewSet,
    PatientEvolutionViewSet,
    PatientMeasurementsViewSet,
    ProgressPhotoViewSet,
    PatientExamsViewSet,
    PatientAppointmentsViewSet,
    ClinicalNoteViewSet,
    patient_notes_view
)

app_name = "patients"

# Configurar o router para o diário e comunidade
diary_router = DefaultRouter()
diary_router.register(r'diary-entries', PatientDiaryEntryViewSet, basename='patient-diary-entry')
diary_router.register(r'comments', SocialCommentViewSet, basename='social-comment')
diary_router.register(r'community', CommunityFeedViewSet, basename='community-feed')

# Router para dados do paciente (metrics, meals, etc.)
patient_data_router = DefaultRouter()
patient_data_router.register(r'metrics', PatientMetricsViewSet, basename='patient-metrics')
patient_data_router.register(r'meals', PatientMealsViewSet, basename='patient-meals')
patient_data_router.register(r'evolution', PatientEvolutionViewSet, basename='patient-evolution')
patient_data_router.register(r'measurements', PatientMeasurementsViewSet, basename='patient-measurements')
patient_data_router.register(r'photos', ProgressPhotoViewSet, basename='progress-photos')
patient_data_router.register(r'exams', PatientExamsViewSet, basename='patient-exams')
patient_data_router.register(r'appointments', PatientAppointmentsViewSet, basename='patient-appointments')
patient_data_router.register(r'notes', ClinicalNoteViewSet, basename='clinical-notes')

urlpatterns = [
    # URLs tradicionais de pacientes
    path("", views.PatientListView.as_view(), name="list_create"),
    path("search/", views.patient_search_view, name="patient-search"),
    path("<int:pk>/", views.PatientDetailView.as_view(), name="detail_update_delete"),
    path("<int:pk>/compare_photos/", views.compare_photos_view, name="compare_photos"),
    path("<int:pk>/resend-password-link/", views.resend_password_reset_link, name="resend_password_link"),

    # URLs do diário e comunidade
    path('diary/', include(diary_router.urls)),

    # URLs de dados do paciente (/patients/me/*)
    path('me/profile/', views.PatientMeView.as_view(), name='patient-me'),
    path('me/', include(patient_data_router.urls)),

    # URLs específicas para nutricionistas gerenciarem anotações de pacientes
    path('<int:patient_pk>/notes/', patient_notes_view, name='patient-notes'),
]
