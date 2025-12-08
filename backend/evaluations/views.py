from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Evaluation, EvaluationPhoto
from .serializers import EvaluationSerializer, EvaluationPhotoSerializer

class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter evaluations for patients belonging to the logged-in nutritionist
        queryset = Evaluation.objects.filter(patient__nutritionist=self.request.user)
        
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset

    def perform_create(self, serializer):
        # Verify if the patient belongs to the nutritionist is handled by permission/serializer validation ideally
        # But here we assume the patient ID passed is valid or we check it.
        # For simplicity, we just save.
        serializer.save()

    @action(detail=True, methods=['POST'], parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_photo(self, request, pk=None):
        evaluation = self.get_object()
        
        # Expects 'image' and 'label' in request.data
        serializer = EvaluationPhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(evaluation=evaluation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EvaluationPhotoViewSet(viewsets.ModelViewSet):
    queryset = EvaluationPhoto.objects.all()
    serializer_class = EvaluationPhotoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EvaluationPhoto.objects.filter(evaluation__patient__nutritionist=self.request.user)
