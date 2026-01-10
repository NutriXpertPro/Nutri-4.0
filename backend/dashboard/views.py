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
        active_patients = PatientProfile.objects.filter(
            nutritionist=nutritionist, is_active=True
        )
        active_patients_count = active_patients.count()

        # Consultas Hoje
        today = timezone.now().date()
        appointments_today_count = Appointment.objects.filter(
            user=nutritionist,
            date__date=today,
            patient__is_active=True
        ).count()

        # Dietas Ativas
        active_diets_count = Diet.objects.filter(
            patient__in=active_patients,
            is_active=True
        ).count()

        # --- Cálculo da Taxa de Progresso em Direção à Meta ---
        total_progress = 0
        patients_with_goals_count = 0

        # Filtra apenas pacientes que têm uma dieta ativa
        patients_with_active_diets = active_patients.filter(diets__is_active=True).distinct()

        for patient in patients_with_active_diets:
            # Requer uma meta de peso e um objetivo definido
            if not patient.target_weight or not patient.goal:
                continue

            # Busca a primeira e a última avaliação do paciente
            evaluations = Evaluation.objects.filter(patient=patient).order_by('date')
            first_eval = evaluations.first()
            latest_eval = evaluations.last()

            # Requer pelo menos duas avaliações para calcular o progresso
            if not first_eval or not latest_eval or first_eval == latest_eval:
                continue
            
            initial_weight = first_eval.weight
            current_weight = latest_eval.weight

            if not initial_weight or not current_weight:
                continue

            patients_with_goals_count += 1
            
            # Lógica para perda de peso/gordura
            if patient.goal in ['PERDA_PESO', 'MANUTENCAO_PESO']:
                total_change_required = float(initial_weight) - float(patient.target_weight)
                change_achieved = float(initial_weight) - float(current_weight)
                
                if total_change_required <= 0:
                    progress = 100.0 if current_weight <= patient.target_weight else 0.0
                else:
                    progress = (change_achieved / total_change_required) * 100
            
            # Lógica para ganho de massa/peso
            elif patient.goal == 'GANHO_MUSCULAR':
                total_change_required = float(patient.target_weight) - float(initial_weight)
                change_achieved = float(current_weight) - float(initial_weight)
                
                if total_change_required <= 0:
                    progress = 100.0 if current_weight >= patient.target_weight else 0.0
                else:
                    progress = (change_achieved / total_change_required) * 100
            
            else:
                progress = 0

            total_progress += max(0, min(progress, 100))

        average_progress_rate = (total_progress / patients_with_goals_count) if patients_with_goals_count > 0 else 0
        
        return Response({
            "active_patients": active_patients_count,
            "appointments_today": appointments_today_count,
            "active_diets": active_diets_count,
            "adhesion_rate": round(average_progress_rate)
        })

class DashboardAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        nutritionist = request.user
        today = timezone.now().date()
        
        appointments = Appointment.objects.filter(
            user=nutritionist,
            date__date=today,
            patient__is_active=True
        ).order_by('date')

        data = []
        for apt in appointments:
            avatar_url = None
            try:
                if hasattr(apt.patient.user, 'profile') and apt.patient.user.profile.profile_picture:
                    avatar_url = request.build_absolute_uri(apt.patient.user.profile.profile_picture.url)
            except Exception:
                pass

            data.append({
                "id": apt.id,
                "patient_name": apt.patient.user.name,
                "time": apt.date.strftime("%H:%M"),
                "type": "Presencial", 
                "duration": 60,
                "status": "scheduled",
                "avatar": avatar_url
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
            date__gte=now,
            patient__is_active=True
        ).order_by('date').first()

        patient = None
        if next_appointment:
            patient = next_appointment.patient
        else:
            # Fallback: Paciente criado mais recentemente
            patient = PatientProfile.objects.filter(nutritionist=nutritionist, is_active=True).order_by('-created_at').first()
        
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

        # Buscar URL do avatar
        avatar_url = None
        try:
            if hasattr(patient.user, 'profile') and patient.user.profile.profile_picture:
                avatar_url = request.build_absolute_uri(patient.user.profile.profile_picture.url)
        except Exception:
            pass

        return Response({
            "id": patient.id,
            "name": patient.user.name,
            "goal": patient.get_goal_display() or "Saúde e Bem-estar",
            "metrics": metrics,
            "avatar": avatar_url
        })


class DashboardBirthdaysView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        nutritionist = request.user
        today = timezone.now().date()
        
        # Filter patients with matching day and month
        patients = PatientProfile.objects.filter(
            nutritionist=nutritionist,
            is_active=True,
            birth_date__month=today.month,
            birth_date__day=today.day
        )

        data = []
        for p in patients:
            avatar_url = None
            try:
                if hasattr(p.user, 'profile') and p.user.profile.profile_picture:
                    avatar_url = request.build_absolute_uri(p.user.profile.profile_picture.url)
            except Exception:
                pass
            
            # Age calculation
            age = p.get_age()

            data.append({
                "id": p.id,
                "name": p.user.name,
                "avatar": avatar_url,
                "age": age,
                "date": today.strftime('%d/%m')
            })
        
        return Response(data)


class PatientDashboardView(APIView):
    """
    API para o dashboard do paciente
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_user = request.user

        # Encontrar o paciente correspondente
        try:
            patient_profile = PatientProfile.objects.get(user=patient_user)
        except PatientProfile.DoesNotExist:
            return Response({
                "message": "Perfil de paciente não encontrado"
            }, status=404)

        # Obter a próxima consulta
        now = timezone.now()
        next_appointment = Appointment.objects.filter(
            patient=patient_profile,
            date__gte=now
        ).order_by('date').first()

        # Obter o plano alimentar atual
        active_diet = Diet.objects.filter(
            patient=patient_profile,
            is_active=True
        ).order_by('-created_at').first()

        # Obter avaliações recentes para o gráfico de evolução
        evaluations = Evaluation.objects.filter(
            patient=patient_profile
        ).order_by('-date')[:10]  # Últimas 10 avaliações

        # Preparar dados das avaliações para o gráfico
        evolution_data = []
        for eval in evaluations:
            evolution_data.append({
                "date": eval.date.strftime("%d/%m/%Y"),
                "weight": eval.weight,
                "body_fat": eval.body_fat,
                "muscle_mass": eval.muscle_mass,
                "bmi": eval.bmi
            })

        # Preparar resposta
        response_data = {
            "patient_profile": {
                "id": patient_profile.id,
                "name": patient_profile.user.name,
                "goal": patient_profile.get_goal_display() or "Saúde e Bem-estar",
                "avatar": request.build_absolute_uri(patient_profile.user.profile.profile_picture.url) if hasattr(patient_profile.user, 'profile') and patient_profile.user.profile.profile_picture else None
            },
            "next_appointment": {
                "id": next_appointment.id,
                "date": next_appointment.date.strftime("%d/%m/%Y"),
                "time": next_appointment.date.strftime("%H:%M"),
                "nutritionist_name": next_appointment.nutritionist.name,
            } if next_appointment else None,
            "current_diet": {
                "id": active_diet.id,
                "name": active_diet.name or "Plano Alimentar",
                "start_date": active_diet.created_at.strftime("%d/%m/%Y"),
            } if active_diet else None,
            "evolution_data": evolution_data,
            "progress_metrics": {
                "weight_change": 0,  # Calcular a diferença de peso desde a primeira avaliação
                "body_fat_change": 0,  # Calcular a diferença de gordura corporal
                "adherence_rate": 0,  # Taxa de adesão baseada em check-ins ou logs
            }
        }

        # Calcular métricas de progresso se houver avaliações suficientes
        if len(evaluations) >= 2:
            first_eval = evaluations.last()  # Mais antiga
            last_eval = evaluations.first()  # Mais recente

            if first_eval.weight and last_eval.weight:
                response_data["progress_metrics"]["weight_change"] = round(last_eval.weight - first_eval.weight, 2)

            if first_eval.body_fat and last_eval.body_fat:
                response_data["progress_metrics"]["body_fat_change"] = round(last_eval.body_fat - first_eval.body_fat, 2)

        return Response(response_data)
