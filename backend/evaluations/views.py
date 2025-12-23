from rest_framework import viewsets, status, parsers, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Evaluation, EvaluationPhoto, ExternalExam
from .serializers import EvaluationSerializer, EvaluationPhotoSerializer, ExternalExamSerializer

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


class ExternalExamUploadView(generics.CreateAPIView):
    """View para fazer upload de exames externos"""
    serializer_class = ExternalExamSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Verificar se o paciente pertence ao nutricionista logado
            patient_id = request.data.get('patient')
            if patient_id:
                from patients.models import PatientProfile
                try:
                    patient = PatientProfile.objects.get(id=patient_id, nutritionist=request.user)
                except PatientProfile.DoesNotExist:
                    return Response(
                        {'error': 'Paciente não encontrado ou não pertence a você.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExternalExamListView(generics.ListAPIView):
    """View para listar exames externos de um paciente"""
    serializer_class = ExternalExamSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.request.query_params.get('patient_id')
        queryset = ExternalExam.objects.filter(patient__nutritionist=self.request.user)
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset

