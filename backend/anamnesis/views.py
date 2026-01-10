from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .models import Anamnesis, AnamnesisTemplate, AnamnesisResponse
from .serializers import AnamnesisSerializer, AnamnesisTemplateSerializer, AnamnesisResponseSerializer


class AnamnesisGeneralViewSet(viewsets.ReadOnlyModelViewSet):
    """
    General Anamnesis ViewSet for listing all anamneses for a nutritionist.
    Maps to /api/v1/anamnesis/
    """
    serializer_class = AnamnesisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Anamnesis.objects.none()

        if hasattr(user, 'user_type') and user.user_type == 'nutricionista':
            queryset = Anamnesis.objects.filter(patient__nutritionist=user)
        else:
            queryset = Anamnesis.objects.filter(patient__user=user)

        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        return queryset


class AnamnesisViewSet(viewsets.ModelViewSet):
    """
    Standard Anamnesis (legacy/fixed model).
    OneToOne with Patient.
    Maps to /api/v1/anamnesis/standard/
    """
    serializer_class = AnamnesisSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve', 'update', 'partial_update']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        patient_id = self.request.query_params.get('patient')
        pk = self.kwargs.get('pk')

        self.log_debug(f"get_queryset - User: {user}, PK: {pk}, PatientID: {patient_id}")

        # Se temos um PK na URL, estamos em uma ação de detalhe (GET, PATCH, DELETE)
        if pk:
            # Para simplificar e garantir que o lookup funcione, retornamos todos
            # O DRF filtrará pelo PK automaticamente. 
            # Em produção, poderíamos adicionar verificações de segurança extras aqui.
            return Anamnesis.objects.all()

        if patient_id:
            return Anamnesis.objects.filter(patient_id=patient_id)

        if user.is_authenticated:
            if hasattr(user, 'user_type') and user.user_type == 'nutricionista':
                return Anamnesis.objects.filter(patient__nutritionist=user)
            else:
                return Anamnesis.objects.filter(patient__user=user)

        return Anamnesis.objects.none()



    def list(self, request, *args, **kwargs):
        # Prevent listing all anamneses for anonymous users without patient ID
        if not request.user.is_authenticated and not request.query_params.get('patient'):
            return Response([])
        return super().list(request, *args, **kwargs)

    def log_debug(self, message):
        import sys
        from django.utils import timezone
        try:
            timestamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
            msg = f"[{timestamp}] [ANAMNESIS] {message}\n"
            sys.stdout.write(msg)
            sys.stdout.flush()
            with open("c:\\Nutri 4.0\\backend\\anamnesis_debug.log", "a", encoding="utf-8") as f:
                f.write(msg)
        except:
            pass

    def create(self, request, *args, **kwargs):
        try:
            self.log_debug(f"--- UPSERT START ---")
            data = request.data
            
            # Strong patient_id extraction (Data > QueryParams > Kwargs)
            patient_id = data.get('patient') or self.request.query_params.get('patient') or self.kwargs.get('pk')
            
            if isinstance(patient_id, (list, tuple)) and len(patient_id) > 0:
                patient_id = patient_id[0]
            
            self.log_debug(f"Target Patient ID: {patient_id}")
            
            existing_instance = None
            if patient_id:
                existing_instance = Anamnesis.objects.filter(patient_id=patient_id).first()
            
            # Use partial=True so 'patient' field is not required in validation if missing
            serializer = self.get_serializer(existing_instance, data=data, partial=True)
            
            if not serializer.is_valid():
                self.log_debug(f"Validation Errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # If creating new record, we MUST ensure the patient relation is set
            # If it's not in validated_data because it was missing in request, we inject it
            if not existing_instance:
                if 'patient' not in serializer.validated_data and patient_id:
                    from patients.models import PatientProfile
                    try:
                        serializer.validated_data['patient'] = PatientProfile.objects.get(id=patient_id)
                    except PatientProfile.DoesNotExist:
                        return Response({"patient": "Paciente não encontrado."}, status=status.HTTP_400_BAD_REQUEST)
            
            self.perform_create(serializer) if not existing_instance else self.perform_update(serializer)
            
            status_code = status.HTTP_201_CREATED if not existing_instance else status.HTTP_200_OK
            return Response(serializer.data, status=status_code)
            
        except Exception as e:
            self.log_debug(f"CRITICAL: {str(e)}")
            import traceback
            self.log_debug(traceback.format_exc())
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        try:
            self.log_debug(f"PATCH CALL - Data keys: {list(request.data.keys())}")
            self.log_debug(f"PATCH CALL - Files: {list(request.FILES.keys())}")
            instance = self.get_object()
            self.log_debug(f"PATCH CALL - Found instance for patient: {instance.patient_id}")
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            if not serializer.is_valid():
                self.log_debug(f"Validation Errors (PATCH): {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            self.log_debug(f"CRITICAL ERROR in patch: {str(e)}")
            self.log_debug(f"Traceback: {error_traceback}")
            print(f"[ANAMNESIS PATCH ERROR] {str(e)}")
            print(error_traceback)
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    @action(detail=False, methods=['get'])
    def evolution(self, request):
        """Retorna o comparativo entre a primeira e a última foto de cada ângulo para um paciente específico."""
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response({"detail": "patient_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        from patients.models import PatientProfile
        from patients.models_patient_data import ProgressPhoto
        from .models import Anamnesis
        
        try:
            patient = PatientProfile.objects.get(id=patient_id)
        except PatientProfile.DoesNotExist:
            return Response({"detail": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Sincronização sob demanda: Garante que fotos da anamnese atual estejam no histórico
        anamnesis = Anamnesis.objects.filter(patient=patient).first()
        if anamnesis:
            self._sync_progress_photos(anamnesis)

        def get_photos(angle_db):
            # Ordenamos por uploaded_at para pegar a primeira e a última temporalmente
            photos = ProgressPhoto.objects.filter(patient=patient, angle=angle_db).order_by('uploaded_at', 'id')
            if not photos.exists():
                return None
            
            first = photos.first()
            last = photos.last()
            
            # Helper para garantir URL absoluta
            def get_url(photo_obj):
                if not photo_obj or not photo_obj.photo:
                    return None
                url = photo_obj.photo.url
                if not url.startswith('http'):
                    return request.build_absolute_uri(url)
                return url

            first_url = get_url(first)
            last_url = get_url(last)
            
            # Se só existir uma foto ou forem iguais, repetimos para o Início e Atual
            return {
                "first": first_url,
                "last": last_url,
                "dates": [
                    first.uploaded_at.strftime("%d/%m/%Y"),
                    last.uploaded_at.strftime("%d/%m/%Y")
                ]
            }

        return Response({
            "frente": get_photos('front'),
            "lado": get_photos('side'),
            "costas": get_photos('back'),
        })

    def perform_update(self, serializer):
        instance = serializer.save()
        self._sync_progress_photos(instance)

    def perform_create(self, serializer):
        instance = serializer.save()
        self._sync_progress_photos(instance)

    def _sync_progress_photos(self, instance):
        """Sincroniza as fotos da anamnese com o histórico de ProgressPhoto de forma robusta."""
        from patients.models_patient_data import ProgressPhoto
        from django.core.files.base import ContentFile
        import os
        
        photos_map = {
            'foto_frente': 'front',
            'foto_lado': 'side',
            'foto_costas': 'back'
        }
        
        for field, angle in photos_map.items():
            photo_file = getattr(instance, field)
            if photo_file:
                try:
                    # Usamos o nome base do arquivo para evitar duplicatas por caminhos diferentes
                    base_name = os.path.basename(photo_file.name)
                    
                    exists = ProgressPhoto.objects.filter(
                        patient=instance.patient, 
                        angle=angle, 
                        photo__icontains=base_name
                    ).exists()
                    
                    if not exists:
                        print(f"[SYNC] Sincronizando {field} ({angle}) para {instance.patient_id}")
                        # Garantir que o arquivo está aberto para leitura
                        photo_file.open('rb')
                        content = photo_file.read()
                        if content:
                            new_photo = ContentFile(content)
                            new_photo.name = base_name
                            ProgressPhoto.objects.create(
                                patient=instance.patient,
                                angle=angle,
                                photo=new_photo
                            )
                        photo_file.close()
                except Exception as e:
                    print(f"[SYNC ERROR] Falha ao sincronizar {field}: {str(e)}")


class AnamnesisTemplateViewSet(viewsets.ModelViewSet):
    """
    Custom Templates CRUD.
    """
    serializer_class = AnamnesisTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AnamnesisTemplate.objects.filter(nutritionist=self.request.user, is_active=True)

class AnamnesisResponseViewSet(viewsets.ModelViewSet):
    """
    Responses to custom anamnesis.
    """
    serializer_class = AnamnesisResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter responses involved with nutritionist's patients
        user = self.request.user
        if not user.is_authenticated:
            return AnamnesisResponse.objects.none()
        
        if hasattr(user, 'user_type') and user.user_type == 'nutricionista':
             queryset = AnamnesisResponse.objects.filter(patient__nutritionist=user)
        else:
             queryset = AnamnesisResponse.objects.filter(patient__user=user)
        
        # Filter by specific patient if provided
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save()
