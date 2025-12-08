from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from patients.models import PatientProfile
from appointments.models import Appointment
from diets.models import Diet

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        nutritionist = request.user
        
        # Pacientes Ativos
        active_patients_count = PatientProfile.objects.filter(
            nutritionist=nutritionist
        ).count()

        # Consultas Hoje
        today = timezone.now().date()
        appointments_today_count = Appointment.objects.filter(
            user=nutritionist,
            date__date=today
        ).count()

        # Dietas Ativas
        active_diets_count = Diet.objects.filter(
            patient__nutritionist=nutritionist,
            is_active=True
        ).count()

        return Response({
            "active_patients": active_patients_count,
            "appointments_today": appointments_today_count,
            "active_diets": active_diets_count,
            "adhesion_rate": 87 
        })

class DashboardAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        nutritionist = request.user
        today = timezone.now().date()
        
        appointments = Appointment.objects.filter(
            user=nutritionist,
            date__date=today
        ).order_by('date')

        data = []
        for apt in appointments:
            data.append({
                "id": apt.id,
                "patient_name": apt.patient.user.name,
                "time": apt.date.strftime("%H:%M"),
                "type": "Presencial", 
                "duration": 60,
                "status": "scheduled",
                "photo": None
            })
        
        return Response(data)

class DashboardFeaturedPatientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        nutritionist = request.user
        patient = PatientProfile.objects.filter(nutritionist=nutritionist).first()
        
        if not patient:
            return Response({})

        return Response({
            "id": patient.id,
            "name": patient.user.name,
            "goal": patient.get_goal_display() or "Saúde e Bem-estar",
            "metrics": {
                "weight": 75.0,
                "body_fat": 20.0,
                "bmi": 24.0,
                "muscle_mass": 30.0,
                "weight_trend": -2.0,
                "body_fat_trend": -1.5,
                "bmi_trend": -0.5,
                "muscle_mass_trend": 1.0,
            },
            "photo": None
        })
