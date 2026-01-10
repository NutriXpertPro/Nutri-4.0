from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import date

from .models import PatientProfile
from .models_patient_data import (
    PatientMetric,
    MealCheckIn,
    ProgressPhoto,
    BodyMeasurement,
    AppointmentConfirmation
)
from .serializers_patient_data import (
    PatientMetricSerializer,
    MealCheckInSerializer,
    ProgressPhotoSerializer,
    BodyMeasurementSerializer
)


class PatientMetricsViewSet(viewsets.ViewSet):
    """
    ViewSet for patient metrics (calories, water, focus).
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """GET /api/v1/patients/me/metrics/"""
        try:
            # DEBUG LOG
            try:
                with open('debug_errors.log', 'a') as f:
                    f.write(f"METRICS REQUEST: User {request.user.id} | Type: {request.user.user_type} | Email: {request.user.email}\n")
            except: pass

            # SEGURANÇA: Impedir acesso de nutricionistas a endpoints de paciente
            if request.user.user_type != 'paciente':
                return Response(
                    {'error': 'Acesso negado. Você está logado como nutricionista em uma área de paciente.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            patient = request.user.patient_profile
            today = date.today()
            
            # Default values
            default_response = {
                'calories': {
                    'current': 0,
                    'goal': 1800,
                    'unit': 'kcal'
                },
                'water': {
                    'current': 0.0,
                    'goal': 2.5,
                    'unit': 'L'
                },
                'focus': {
                    'current': 0,
                    'goal': 100,
                    'unit': '%'
                }
            }
            
            try:
                # Get or create today's metrics
                metric, created = PatientMetric.objects.get_or_create(
                    patient=patient,
                    date=today,
                    defaults={
                        'calories_goal': 1800,
                        'water_goal': 2.5,
                        'focus_goal': 100
                    }
                )
                
                return Response({
                    'calories': {
                        'current': metric.calories_consumed,
                        'goal': metric.calories_goal,
                        'unit': 'kcal'
                    },
                    'water': {
                        'current': float(metric.water_consumed),
                        'goal': float(metric.water_goal),
                        'unit': 'L'
                    },
                    'focus': {
                        'current': metric.focus_score,
                        'goal': metric.focus_goal,
                        'unit': '%'
                    }
                })
            except Exception as db_error:
                # Table may not exist yet (migrations not run)
                import logging
                logging.warning(f"PatientMetric table error: {db_error}")
                return Response(default_response)
                
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging
            logging.error(f"Metrics error: {e}")
            return Response({
                'calories': {'current': 0, 'goal': 1800, 'unit': 'kcal'},
                'water': {'current': 0.0, 'goal': 2.5, 'unit': 'L'},
                'focus': {'current': 0, 'goal': 100, 'unit': '%'}
            })


class PatientMealsViewSet(viewsets.ViewSet):
    """
    ViewSet for patient meals - fetches from real Diet model.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """GET /api/v1/patients/me/meals/"""
        from diets.models import Diet, Meal
        from datetime import datetime
        
        try:
            # DEBUG LOG
            try:
                with open('debug_errors.log', 'a') as f:
                    f.write(f"MEALS REQUEST: User {request.user.id} | Type: {request.user.user_type}\n")
            except: pass

            # SEGURANÇA: Impedir acesso de nutricionistas
            if request.user.user_type != 'paciente':
                return Response(
                    {'error': 'Acesso negado. Você está logado como nutricionista em uma área de paciente.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            patient = request.user.patient_profile
            today = datetime.now()
            current_day = today.weekday()  # 0=Monday, 6=Sunday
            current_time = today.time()
            
            # Get active diet for patient
            active_diet = Diet.objects.filter(patient=patient, is_active=True).first()
            
            if not active_diet:
                return Response([])
            
            # Get meals for today from the diet
            meals = Meal.objects.filter(
                diet=active_diet,
                day_of_week=current_day
            ).prefetch_related('items').order_by('time')
            
            result = []
            for meal in meals:
                # Determine status based on time
                if meal.time < current_time:
                    status = 'completed'
                elif meal.time.hour == current_time.hour:
                    status = 'current'
                else:
                    status = 'pending'
                
                # Check if already checked-in today
                checkin_exists = MealCheckIn.objects.filter(
                    patient=patient,
                    meal=meal,
                    checked_in_at__date=today.date()
                ).exists()
                
                if checkin_exists:
                    status = 'completed'
                
                # Get food items
                foods = [item.food_name for item in meal.items.all()]
                total_calories = 0
                for item in meal.items.all():
                    try:
                        cal = float(item.calories) if item.calories is not None else 0
                        total_calories += cal
                    except (ValueError, TypeError):
                        pass
                
                result.append({
                    'id': meal.id,
                    'name': meal.name,
                    'time': meal.time.strftime('%H:%M'),
                    'calories': int(total_calories),
                    'foods': foods,
                    'status': status
                })
            
            return Response(result)
            
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"CRITICAL ERROR IN MEALS VIEW: {error_details}")
            return Response(
                {'error': 'Internal Server Error', 'details': error_details, 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """POST /api/v1/patients/me/meals/{id}/check-in/"""
        from diets.models import Meal
        
        try:
            patient = request.user.patient_profile
            meal = get_object_or_404(Meal, pk=pk)
            
            # Create check-in record
            MealCheckIn.objects.create(
                patient=patient,
                meal=meal
            )
            
            return Response({'status': 'checked_in'}, status=status.HTTP_200_OK)
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PatientEvolutionViewSet(viewsets.ViewSet):
    """
    ViewSet for patient evolution data (weight, fat, muscle) from Evaluations.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """GET /api/v1/patients/me/evolution/?metric=weight&period=3m"""
        from evaluations.models import Evaluation
        from datetime import datetime, timedelta
        
        try:
            # SEGURANÇA
            if request.user.user_type != 'paciente':
                return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)

            patient = request.user.patient_profile
            metric_type = request.query_params.get('metric', 'weight')
            period = request.query_params.get('period', '3m')  # 1m, 3m, 6m, 1y
            
            # Calculate date range based on period
            today = datetime.now()
            if period == '1m':
                start_date = today - timedelta(days=30)
            elif period == '3m':
                start_date = today - timedelta(days=90)
            elif period == '6m':
                start_date = today - timedelta(days=180)
            elif period == '1y':
                start_date = today - timedelta(days=365)
            else:
                start_date = today - timedelta(days=90)  # Default 3 months
            
            # Fetch evaluations for the period
            evaluations = Evaluation.objects.filter(
                patient=patient,
                date__gte=start_date
            ).order_by('date')
            
            result = []
            for evaluation in evaluations:
                # Select the appropriate metric
                if metric_type == 'weight':
                    value = float(evaluation.weight) if evaluation.weight else None
                elif metric_type == 'fat':
                    value = float(evaluation.body_fat) if evaluation.body_fat else None
                elif metric_type == 'muscle':
                    value = float(evaluation.muscle_mass) if evaluation.muscle_mass else None
                else:
                    value = float(evaluation.weight) if evaluation.weight else None
                
                if value is not None:
                    result.append({
                        'date': evaluation.date.strftime('%d/%m'),
                        'value': value
                    })
            
            return Response(result)
            
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PatientMeasurementsViewSet(viewsets.ViewSet):
    """
    ViewSet for body measurements.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """GET /api/v1/patients/me/measurements/"""
        try:
            if request.user.user_type != 'paciente':
                return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)

            patient = request.user.patient_profile
            measurements = BodyMeasurement.objects.filter(patient=patient).order_by('-date')
            
            if measurements.exists():
                latest = measurements.first()
                initial = measurements.last()
                
                return Response([
                    {
                        'bodyPart': 'waist',
                        'initial': float(initial.waist) if initial.waist else 0,
                        'current': float(latest.waist) if latest.waist else 0,
                        'unit': 'cm'
                    },
                    {
                        'bodyPart': 'arms',
                        'initial': float(initial.arms) if initial.arms else 0,
                        'current': float(latest.arms) if latest.arms else 0,
                        'unit': 'cm'
                    }
                ])
            return Response([])
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ProgressPhotoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for progress photos.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProgressPhotoSerializer
    
    def get_queryset(self):
        if self.request.user.user_type != 'paciente':
            return ProgressPhoto.objects.none()
        return ProgressPhoto.objects.filter(patient=self.request.user.patient_profile)
    
    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)


class PatientExamsViewSet(viewsets.ViewSet):
    """
    ViewSet for patient external exams.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """GET /api/v1/patients/me/exams/"""
        from evaluations.models import ExternalExam
        
        try:
            if request.user.user_type != 'paciente':
                return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)

            patient = request.user.patient_profile
            exams = ExternalExam.objects.filter(patient=patient).order_by('-uploaded_at')
            
            result = []
            for exam in exams:
                result.append({
                    'id': exam.id,
                    'file_name': exam.file_name,
                    'file_type': exam.file_type,
                    'notes': exam.notes,
                    'uploaded_at': exam.uploaded_at.strftime('%d/%m/%Y'),
                    'file_url': exam.file.url if exam.file else None
                })
            
            return Response(result)
            
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PatientAppointmentsViewSet(viewsets.ViewSet):
    """
    ViewSet for patient appointments.
    """
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """GET /api/v1/patients/me/appointments/?status=upcoming"""
        from appointments.models import Appointment
        from datetime import datetime
        
        try:
            if request.user.user_type != 'paciente':
                return Response({'error': 'Acesso negado.'}, status=status.HTTP_403_FORBIDDEN)

            patient = request.user.patient_profile
            status_filter = request.query_params.get('status', 'upcoming')
            today = datetime.now()
            
            # Base queryset
            appointments = Appointment.objects.filter(patient=patient)
            
            # Filter by status
            if status_filter == 'upcoming':
                appointments = appointments.filter(date__gte=today.date()).order_by('date', 'time')
            elif status_filter == 'past':
                appointments = appointments.filter(date__lt=today.date()).order_by('-date', '-time')
            
            result = []
            for apt in appointments:
                result.append({
                    'id': apt.id,
                    'date': apt.date.strftime('%Y-%m-%d'),
                    'rawDate': apt.date.isoformat(),
                    'time': apt.time.strftime('%H:%M') if apt.time else '',
                    'title': f'Consulta com {apt.user.name}' if apt.user else 'Consulta',
                    'specialty': 'Nutricionista',
                    'type': apt.type if hasattr(apt, 'type') else 'Presencial',
                    'status': apt.status if hasattr(apt, 'status') else 'scheduled',
                    'videoLink': getattr(apt, 'meeting_link', None),
                    'location': getattr(apt, 'location', ''),
                    'notes': getattr(apt, 'notes', '')
                })
            
            return Response(result)
            
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging
            logging.error(f"Appointments error: {e}")
            return Response([])
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """POST /api/v1/patients/me/appointments/{id}/confirm/"""
        from appointments.models import Appointment
        
        try:
            patient = request.user.patient_profile
            appointment = get_object_or_404(Appointment, pk=pk, patient=patient)
            
            # Update status to confirmed
            if hasattr(appointment, 'status'):
                appointment.status = 'confirmed'
                appointment.save()
            
            return Response({'status': 'confirmed'})
            
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def destroy(self, request, pk=None):
        """DELETE /api/v1/patients/me/appointments/{id}/ (cancel)"""
        from appointments.models import Appointment
        
        try:
            patient = request.user.patient_profile
            appointment = get_object_or_404(Appointment, pk=pk, patient=patient)
            
            # Update status to cancelled
            if hasattr(appointment, 'status'):
                appointment.status = 'cancelled'
                appointment.save()
            
            return Response({'status': 'cancelled'})
            
        except PatientProfile.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
