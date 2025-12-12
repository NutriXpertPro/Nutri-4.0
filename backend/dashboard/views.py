from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from patients.models import PatientProfile
from appointments.models import Appointment
from diets.models import Diet
from evaluations.models import Evaluation

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
        now = timezone.now()
        
        # Prioridade 1: Paciente com a próxima consulta
        next_appointment = Appointment.objects.filter(
            user=nutritionist, 
            date__gte=now
        ).order_by('date').first()

        patient = None
        if next_appointment:
            patient = next_appointment.patient
        else:
            # Fallback: Paciente criado mais recentemente
            patient = PatientProfile.objects.filter(nutritionist=nutritionist).order_by('-created_at').first()
        
        if not patient:
            # Retorna uma resposta vazia se nenhum paciente for encontrado
            return Response({})

        # Buscar as duas últimas avaliações para o paciente encontrado
        evaluations = Evaluation.objects.filter(patient=patient).order_by('-date')[:2]
        
        latest_eval = evaluations[0] if len(evaluations) > 0 else None
        previous_eval = evaluations[1] if len(evaluations) > 1 else None

        metrics = {
            "weight": 0, "body_fat": 0, "bmi": 0, "muscle_mass": 0,
            "weight_trend": 0, "body_fat_trend": 0, "bmi_trend": 0, "muscle_mass_trend": 0,
        }

        if latest_eval:
            metrics.update({
                "weight": latest_eval.weight or 0,
                "body_fat": latest_eval.body_fat or 0,
                "bmi": latest_eval.bmi or 0,
                "muscle_mass": latest_eval.muscle_mass or 0,
            })

            if previous_eval:
                metrics.update({
                    "weight_trend": (latest_eval.weight or 0) - (previous_eval.weight or 0),
                    "body_fat_trend": (latest_eval.body_fat or 0) - (previous_eval.body_fat or 0),
                    "bmi_trend": (latest_eval.bmi or 0) - (previous_eval.bmi or 0),
                    "muscle_mass_trend": (latest_eval.muscle_mass or 0) - (previous_eval.muscle_mass or 0),
                })

        # O campo Photo não existe no modelo User ou PatientProfile.
        # Retornando None para evitar o crash, conforme o contrato da API.
        photo_url = None

        return Response({
            "id": patient.id,
            "name": patient.user.name,
            "goal": patient.get_goal_display() or "Saúde e Bem-estar",
            "metrics": metrics,
            "photo": photo_url
        })
