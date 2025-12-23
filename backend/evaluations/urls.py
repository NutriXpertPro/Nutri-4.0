from django.urls import path
from . import views

app_name = "evaluations"

urlpatterns = [
    # Evaluations CRUD
    path('', views.EvaluationViewSet.as_view({'get': 'list', 'post': 'create'}), name='evaluation-list'),
    path('<int:pk>/', views.EvaluationViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='evaluation-detail'),
    path('<int:pk>/upload_photo/', views.EvaluationViewSet.as_view({'post': 'upload_photo'}), name='evaluation-upload-photo'),
    # Photos
    path('photos/', views.EvaluationPhotoViewSet.as_view({'get': 'list'}), name='evaluation-photo-list'),
    path('photos/<int:pk>/', views.EvaluationPhotoViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='evaluation-photo-detail'),
    # External Exams
    path('external-exams/upload/', views.ExternalExamUploadView.as_view(), name='external-exam-upload'),
    path('external-exams/', views.ExternalExamListView.as_view(), name='external-exam-list'),
]

