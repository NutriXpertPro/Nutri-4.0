from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from datetime import date
import unicodedata

from .models import PatientProfile
from .models_patient_data import (
    PatientMetric,
    MealCheckIn,
    ProgressPhoto,
    AppointmentConfirmation,
    ClinicalNote,
    MealPhoto,
)
from .serializers_patient_data import (
    PatientMetricSerializer,
    MealCheckInSerializer,
    ProgressPhotoSerializer,
    BodyMeasurementSerializer,
    ClinicalNoteSerializer,
    MealPhotoSerializer,
)
import unicodedata

def normalize_text(text):
    if not text:
        return ""
    text = (
        unicodedata.normalize("NFKD", text)
        .encode("ascii", "ignore")
        .decode("utf8")
    )
    return text.lower().strip()

def get_significant_words(text):
    words = normalize_text(text).split()
    return [w for w in words if len(w) > 3]


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
                with open("debug_errors.log", "a") as f:
                    f.write(
                        f"METRICS REQUEST: User {request.user.id} | Type: {request.user.user_type} | Email: {request.user.email}\n"
                    )
            except:
                pass

            # SEGURANÇA: Impedir acesso de nutricionistas a endpoints de paciente
            if request.user.user_type != "paciente":
                return Response(
                    {
                        "error": "Acesso negado. Você está logado como nutricionista em uma área de paciente."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            patient = request.user.patient_profile
            today = date.today()

            # Default values
            default_response = {
                "calories": {"current": 0, "goal": 1800, "unit": "kcal"},
                "water": {"current": 0.0, "goal": 2.5, "unit": "L"},
                "focus": {"current": 0, "goal": 100, "unit": "%"},
            }

            try:
                # Get or create today's metrics
                metric, created = PatientMetric.objects.get_or_create(
                    patient=patient,
                    date=today,
                    defaults={
                        "calories_goal": 1800,
                        "water_goal": 2.5,
                        "focus_goal": 100,
                    },
                )

                return Response(
                    {
                        "calories": {
                            "current": metric.calories_consumed,
                            "goal": metric.calories_goal,
                            "unit": "kcal",
                        },
                        "water": {
                            "current": float(metric.water_consumed),
                            "goal": float(metric.water_goal),
                            "unit": "L",
                        },
                        "focus": {
                            "current": metric.focus_score,
                            "goal": metric.focus_goal,
                            "unit": "%",
                        },
                    }
                )
            except Exception as db_error:
                # Table may not exist yet (migrations not run)
                import logging

                logging.warning(f"PatientMetric table error: {db_error}")
                return Response(default_response)

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging

            logging.error(f"Metrics error: {e}")
            return Response(
                {
                    "calories": {"current": 0, "goal": 1800, "unit": "kcal"},
                    "water": {"current": 0.0, "goal": 2.5, "unit": "L"},
                    "focus": {"current": 0, "goal": 100, "unit": "%"},
                }
            )


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
                with open("debug_errors.log", "a") as f:
                    f.write(
                        f"MEALS REQUEST: User {request.user.id} | Type: {request.user.user_type}\n"
                    )
            except:
                pass

            # SEGURANÇA: Impedir acesso de nutricionistas
            if request.user.user_type != "paciente":
                return Response(
                    {
                        "error": "Acesso negado. Você está logado como nutricionista em uma área de paciente."
                    },
                    status=status.HTTP_403_FORBIDDEN,
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
            meals = (
                Meal.objects.filter(diet=active_diet, day_of_week=current_day)
                .prefetch_related("items")
                .order_by("time")
            )

            # FALLBACK: Se não houver refeições para hoje, tentar dia 0 (padrão)
            # ou o primeiro dia disponível na dieta.
            if not meals.exists():
                available_days = Meal.objects.filter(diet=active_diet).values_list('day_of_week', flat=True).distinct()
                if available_days.exists():
                    fallback_day = 0 if 0 in available_days else sorted(list(available_days))[0]
                    meals = (
                        Meal.objects.filter(diet=active_diet, day_of_week=fallback_day)
                        .prefetch_related("items")
                        .order_by("time")
                    )

            result = []
            for meal in meals:
                # Determine status based on time
                if meal.time < current_time:
                    status = "completed"
                elif meal.time.hour == current_time.hour:
                    status = "current"
                else:
                    status = "pending"

                # Check if already checked-in today
                checkin_exists = MealCheckIn.objects.filter(
                    patient=patient, meal=meal, checked_in_at__date=today.date()
                ).exists()

                if checkin_exists:
                    status = "completed"

                # Get food items structured
                items = []
                total_calories = 0
                total_protein = 0
                total_carbs = 0
                total_fats = 0

                # Get diet-wide substitutions
                diet_subs = active_diet.substitutions or []
                print(
                    f"DEBUG: Dieta '{active_diet.name}' ativa. Regras de substituição: {len(diet_subs)}"
                )

                for item in meal.items.all():
                    item_calories = float(item.calories) if item.calories else 0
                    item_protein = float(item.protein) if item.protein else 0
                    item_carbs = float(item.carbs) if item.carbs else 0
                    item_fats = float(item.fats) if item.fats else 0

                    total_calories += item_calories
                    total_protein += item_protein
                    total_carbs += item_carbs
                    total_fats += item_fats



                # === SUBSTITUTION LOGIC ===
                    # 1. Prioritize Strict/Manual Substitutions from the Diet Plan
                    # This ensures that what the nutritionist explicitly defined is what the patient sees.
                    
                    sub_options = []
                    found_manual_sub = False

                    # Normalize current item name for matching
                    item_name_norm = normalize_text(item.food_name)
                    
                    for sub_group in diet_subs:
                        original_name = sub_group.get("original", "")
                        original_norm = normalize_text(original_name)
                        
                        # Check for exact match or robust containment (both ways)
                        # We also check if the item is part of the original name or vice-versa
                        # This handles cases like "Arroz Branco" matching "Arroz"
                        is_match = False
                        if original_norm and (
                            original_norm == item_name_norm 
                            or original_norm in item_name_norm
                            or item_name_norm in original_norm
                        ):
                            is_match = True
                        
                        if is_match:
                            try:
                                # Add manual options
                                for opt in sub_group.get("options", []):
                                    sub_options.append({
                                        "name": opt.get("name", ""),
                                        "quantity": float(opt.get("quantity", 0)),
                                        "unit": opt.get("unit", item.unit),
                                        "kcal": 0, # Frontend handles display or we could calc if DB link existed
                                        "group": "Indicado pelo Nutri",
                                        "source": "manual"
                                    })
                                found_manual_sub = True
                                print(f"DEBUG: MATCH MANUAL ENCONTRADO para {item.food_name} com regra {original_name}!")
                            except Exception as sub_err:
                                print(f"Erro ao processar substituição manual: {sub_err}")
                    
                    # 2. Auto-Substitutions (Fallback)
                    # This searches for similar foods in the same nutritional group
                    if not found_manual_sub:
                        try:
                            from diets.nutritional_substitution import (
                                sugerir_substitucoes, 
                                identificar_grupo_nutricional, 
                                NutricaoAlimento,
                                alimento_taco_para_nutricao
                            )
                            from diets.models import AlimentoTACO
                            
                            # Use logic centralizada e estrita
                            # 1. Identificar se vale a pena buscar (se for agua de coco, já volta vazio ou grupo de bloqueio)
                            group_name = identificar_grupo_nutricional(item.food_name)
                            
                            # Se for grupo de bloqueio (agua_de_coco), nem busca candidatos
                            if group_name == "agua_de_coco":
                                # Logica de bloqueio explícito
                                pass
                            elif group_name:
                                # Create NutricaoAlimento for current item
                                current_nutri = NutricaoAlimento(
                                    nome=item.food_name,
                                    energia_kcal=item_calories * (100.0/float(item.quantity)) if float(item.quantity) > 0 else 0,
                                    proteina_g=item_protein * (100.0/float(item.quantity)) if float(item.quantity) > 0 else 0,
                                    lipidios_g=item_fats * (100.0/float(item.quantity)) if float(item.quantity) > 0 else 0,
                                    carboidrato_g=item_carbs * (100.0/float(item.quantity)) if float(item.quantity) > 0 else 0,
                                    fibra_g=float(item.fiber or 0) * (100.0/float(item.quantity)) if float(item.quantity) > 0 else 0
                                )
                                
                                # Fetch candidates (optimized slice)
                                candidates_taco = [alimento_taco_para_nutricao(f) for f in AlimentoTACO.objects.all()[:1000]]
                                
                                # Call the STRICT engine
                                suggestions = sugerir_substitucoes(current_nutri, candidates_taco, float(item.quantity), limit_resultados=5)
                                
                                for res in suggestions:
                                    sub_options.append({
                                        "name": res.alimento_substituto,
                                        "quantity": res.quantidade_substituto_g,
                                        "unit": "g",
                                        "kcal": res.calorias_substituto,
                                        "group": res.grupo.replace("_", " ").title(),
                                        "source": "auto"
                                    })
                        except Exception as auto_err:
                            print(f"Erro no fallback de substituição: {auto_err}")
                            
                    # ID e Fonte Técnica para Substituições Precisas
                    item_food_id = None
                    item_source = "TACO"
                    if item.taco_food:
                        item_food_id = item.taco_food.id
                        item_source = "TACO"
                    elif item.tbca_food:
                        item_food_id = item.tbca_food.id
                        item_source = "TBCA"
                    elif item.usda_food:
                        item_food_id = item.usda_food.id
                        item_source = "USDA"

                    items.append(
                        {
                            "name": item.food_name,
                            "quantity": float(item.quantity),
                            "unit": item.unit,
                            "kcal": item_calories,
                            "protein": item_protein,
                            "carbs": item_carbs,
                            "fats": item_fats,
                            "food_id": item_food_id,
                            "food_source": item_source,
                            "substitutions": sub_options,
                        }
                    )

                result.append(
                    {
                        "id": meal.id,
                        "name": meal.name,
                        "time": meal.time.strftime("%H:%M"),
                        "calories": int(total_calories),
                        "protein": int(total_protein),
                        "carbs": int(total_carbs),
                        "fats": int(total_fats),
                        "items": items,
                        "status": status,
                    }
                )

            return Response(result)

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"CRITICAL ERROR IN MEALS VIEW: {error_details}")
            
            # Log to file for debugging
            try:
                with open("debug_errors.log", "a") as f:
                    f.write(f"\nCRITICAL ERROR in MEALS VIEW at {datetime.now()}:\n{error_details}\n")
            except:
                pass

            return Response(
                {
                    "error": "Internal Server Error",
                    "details": error_details,
                    "message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def check_in(self, request, pk=None):
        """POST /api/v1/patients/me/meals/{id}/check-in/"""
        from diets.models import Meal

        try:
            patient = request.user.patient_profile
            meal = get_object_or_404(Meal, pk=pk)

            # Create check-in record
            MealCheckIn.objects.create(patient=patient, meal=meal)

            # Criar notificação para o nutricionista
            try:
                from notifications.models import Notification
                from django.utils import timezone
                
                Notification.objects.create(
                    user=patient.nutritionist,
                    title="Novo Check-in de Refeição! 🥗",
                    message=f"Seu paciente {patient.user.name} registrou a refeição: {meal.name}.",
                    notification_type="meal_checkin",
                    sent_at=timezone.now()
                )
            except Exception as e:
                print(f"Erro ao criar notificação de check-in: {e}")

            return Response({"status": "checked_in"}, status=status.HTTP_200_OK)
        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def upload_photo(self, request, pk=None):
        """POST /api/v1/patients/me/meals/{id}/upload_photo/"""
        patient = request.user.patient_profile
        from diets.models import Meal

        try:
            meal = Meal.objects.get(id=pk)
            # Verify meal belongs to patient's active diet
            if meal.diet.patient != patient:
                return Response(
                    {"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN
                )

            photo_file = request.FILES.get("photo")
            if not photo_file:
                return Response(
                    {"error": "No photo provided"}, status=status.HTTP_400_BAD_REQUEST
                )

            meal_photo = MealPhoto.objects.create(
                patient=patient, meal=meal, photo=photo_file
            )

            serializer = MealPhotoSerializer(meal_photo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Meal.DoesNotExist:
            return Response(
                {"error": "Meal not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["post"])
    def check_in_all(self, request):
        """POST /api/v1/patients/me/meals/check_in_all/"""
        patient = request.user.patient_profile
        from diets.models import Diet, Meal
        from datetime import datetime

        today = datetime.now()
        current_day = today.weekday()

        active_diet = Diet.objects.filter(patient=patient, is_active=True).first()
        if not active_diet:
            return Response(
                {"error": "No active diet found"}, status=status.HTTP_404_NOT_FOUND
            )

        meals = Meal.objects.filter(diet=active_diet, day_of_week=current_day)

        count = 0
        for meal in meals:
            checkin, created = MealCheckIn.objects.get_or_create(
                patient=patient,
                meal=meal,
                checked_in_at__date=today.date(),
                defaults={"checked_in_at": today},
            )
            if created:
                count += 1

        return Response(
            {"message": f"{count} refeições registradas com sucesso."},
            status=status.HTTP_200_OK,
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
            if request.user.user_type != "paciente":
                return Response(
                    {"error": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN
                )

            patient = request.user.patient_profile
            metric_type = request.query_params.get("metric", "weight")
            period = request.query_params.get("period", "3m")  # 1m, 3m, 6m, 1y

            # Calculate date range based on period
            today = datetime.now()
            if period == "1m":
                start_date = today - timedelta(days=30)
            elif period == "3m":
                start_date = today - timedelta(days=90)
            elif period == "6m":
                start_date = today - timedelta(days=180)
            elif period == "1y":
                start_date = today - timedelta(days=365)
            else:
                start_date = today - timedelta(days=90)  # Default 3 months

            # Fetch evaluations for the period
            evaluations = Evaluation.objects.filter(
                patient=patient, date__gte=start_date
            ).order_by("date")

            result = []
            for evaluation in evaluations:
                # Select the appropriate metric
                if metric_type == "weight":
                    value = float(evaluation.weight) if evaluation.weight else None
                elif metric_type == "fat":
                    value = float(evaluation.body_fat) if evaluation.body_fat else None
                elif metric_type == "muscle":
                    value = (
                        float(evaluation.muscle_mass)
                        if evaluation.muscle_mass
                        else None
                    )
                else:
                    value = float(evaluation.weight) if evaluation.weight else None

                if value is not None:
                    result.append(
                        {"date": evaluation.date.strftime("%d/%m"), "value": value}
                    )

            return Response(result)

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class PatientMeasurementsViewSet(viewsets.ViewSet):
    """
    ViewSet for body measurements.
    """

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """GET /api/v1/patients/me/measurements/"""
        try:
            if request.user.user_type != "paciente":
                return Response(
                    {"error": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN
                )

            patient = request.user.patient_profile
            measurements = BodyMeasurement.objects.filter(patient=patient).order_by(
                "-date"
            )

            if measurements.exists():
                latest = measurements.first()
                initial = measurements.last()

                return Response(
                    [
                        {
                            "bodyPart": "waist",
                            "initial": float(initial.waist) if initial.waist else 0,
                            "current": float(latest.waist) if latest.waist else 0,
                            "unit": "cm",
                        },
                        {
                            "bodyPart": "arms",
                            "initial": float(initial.arms) if initial.arms else 0,
                            "current": float(latest.arms) if latest.arms else 0,
                            "unit": "cm",
                        },
                    ]
                )
            return Response([])
        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ProgressPhotoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for progress photos.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ProgressPhotoSerializer

    def get_queryset(self):
        if self.request.user.user_type != "paciente":
            return ProgressPhoto.objects.none()
        return ProgressPhoto.objects.filter(patient=self.request.user.patient_profile)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)

    @action(detail=False, methods=["GET"])
    def comparison(self, request):
        """
        Retorna as fotos iniciais (da anamnese) e as mais recentes (do progresso)
        para comparação visual na aba de evolução.
        """
        from anamnesis.models import Anamnesis

        try:
            patient = request.user.patient_profile

            # 1. Fotos Iniciais (Anamnese)
            initial_data = {"front": None, "side": None, "back": None, "date": None}
            try:
                anamnesis = Anamnesis.objects.get(patient=patient)
                initial_data["front"] = (
                    request.build_absolute_uri(anamnesis.foto_frente.url)
                    if anamnesis.foto_frente
                    else None
                )
                initial_data["side"] = (
                    request.build_absolute_uri(anamnesis.foto_lado.url)
                    if anamnesis.foto_lado
                    else None
                )
                initial_data["back"] = (
                    request.build_absolute_uri(anamnesis.foto_costas.url)
                    if anamnesis.foto_costas
                    else None
                )
                initial_data["date"] = anamnesis.created_at.strftime("%Y-%m-%d")
            except Anamnesis.DoesNotExist:
                pass

            # 2. Fotos Atuais (ProgressPhoto mais recentes - Apenas se forem diferentes da inicial)
            current_data = {"front": None, "side": None, "back": None}
            for angle_code, angle_name in [
                ("front", "front"),
                ("side", "side"),
                ("back", "back"),
            ]:
                latest_photo = (
                    ProgressPhoto.objects.filter(patient=patient, angle=angle_code)
                    .order_by("-uploaded_at")
                    .first()
                )

                if latest_photo:
                    url = request.build_absolute_uri(latest_photo.photo.url)
                    initial_url = initial_data[angle_name]

                    # Só adicionamos como "Atual" se for uma foto DIFERENTE da inicial
                    # (A sincronização de anamnese cria um ProgressPhoto com o mesmo nome de arquivo)
                    import os

                    is_sync_duplicate = False
                    if initial_url:
                        latest_filename = os.path.basename(latest_photo.photo.name)
                        if initial_url.endswith(latest_filename):
                            is_sync_duplicate = True

                    if not is_sync_duplicate:
                        current_data[angle_name] = {
                            "url": url,
                            "date": latest_photo.uploaded_at.strftime("%Y-%m-%d"),
                        }

            return Response({"initial": initial_data, "current": current_data})

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PatientExamsViewSet(viewsets.ViewSet):
    """
    ViewSet for patient external exams.
    """

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """GET /api/v1/patients/me/exams/"""
        from evaluations.models import ExternalExam

        try:
            if request.user.user_type != "paciente":
                return Response(
                    {"error": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN
                )

            patient = request.user.patient_profile
            exams = ExternalExam.objects.filter(patient=patient).order_by(
                "-uploaded_at"
            )

            result = []
            for exam in exams:
                result.append(
                    {
                        "id": exam.id,
                        "file_name": exam.file_name,
                        "file_type": exam.file_type,
                        "notes": exam.notes,
                        "uploaded_at": exam.uploaded_at.strftime("%d/%m/%Y"),
                        "file_url": exam.file.url if exam.file else None,
                    }
                )

            return Response(result)

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
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
            if request.user.user_type != "paciente":
                return Response(
                    {"error": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN
                )

            patient = request.user.patient_profile
            status_filter = request.query_params.get("status", "upcoming")
            today = datetime.now()

            # Base queryset
            appointments = Appointment.objects.filter(patient=patient)

            # Filter by status
            if status_filter == "upcoming":
                appointments = appointments.filter(date__gte=today.date()).order_by(
                    "date", "time"
                )
            elif status_filter == "past":
                appointments = appointments.filter(date__lt=today.date()).order_by(
                    "-date", "-time"
                )

            result = []
            for apt in appointments:
                result.append(
                    {
                        "id": apt.id,
                        "date": apt.date.strftime("%Y-%m-%d"),
                        "rawDate": apt.date.isoformat(),
                        "time": apt.time.strftime("%H:%M") if apt.time else "",
                        "title": f"Consulta com {apt.user.name}"
                        if apt.user
                        else "Consulta",
                        "specialty": "Nutricionista",
                        "type": apt.type if hasattr(apt, "type") else "Presencial",
                        "status": apt.status if hasattr(apt, "status") else "scheduled",
                        "videoLink": getattr(apt, "meeting_link", None),
                        "location": getattr(apt, "location", ""),
                        "notes": getattr(apt, "notes", ""),
                    }
                )

            return Response(result)

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging

            logging.error(f"Appointments error: {e}")
            return Response([])

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """POST /api/v1/patients/me/appointments/{id}/confirm/"""
        from appointments.models import Appointment

        try:
            patient = request.user.patient_profile
            appointment = get_object_or_404(Appointment, pk=pk, patient=patient)

            # Update status to confirmed
            if hasattr(appointment, "status"):
                appointment.status = "confirmed"
                appointment.save()

            return Response({"status": "confirmed"})

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, pk=None):
        """DELETE /api/v1/patients/me/appointments/{id}/ (cancel)"""
        from appointments.models import Appointment

        try:
            patient = request.user.patient_profile
            appointment = get_object_or_404(Appointment, pk=pk, patient=patient)

            # Update status to cancelled
            if hasattr(appointment, "status"):
                appointment.status = "cancelled"
                appointment.save()

            return Response({"status": "cancelled"})

        except PatientProfile.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"}, status=status.HTTP_404_NOT_FOUND
            )


class ClinicalNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for clinical notes (read/create).
    """

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        from .serializers_patient_data import ClinicalNoteSerializer

        return ClinicalNoteSerializer

    def get_queryset(self):
        user = self.request.user

        # Se for paciente, retorna apenas suas próprias anotações
        if user.user_type == "paciente":
            return user.patient_profile.notes.all().order_by("-created_at")

        # Se for nutricionista, permite ver anotações de seus pacientes
        elif user.user_type == "nutricionista":
            # Retorna anotações de todos os pacientes gerenciados pelo nutricionista
            patient_ids = PatientProfile.objects.filter(nutritionist=user).values_list(
                "id", flat=True
            )
            return ClinicalNote.objects.filter(patient_id__in=patient_ids).order_by(
                "-created_at"
            )

        # Para outros tipos de usuário, retorna queryset vazio
        return ClinicalNote.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        # Se for paciente, associa à própria conta
        if user.user_type == "paciente":
            serializer.save(patient=user.patient_profile)
        # Se for nutricionista, verificar se está tentando criar para um de seus pacientes
        elif user.user_type == "nutricionista":
            patient_id = self.request.data.get("patient_id")
            if patient_id:
                # Verificar se o paciente pertence ao nutricionista
                try:
                    patient = PatientProfile.objects.get(
                        id=patient_id, nutritionist=user
                    )
                    serializer.save(patient=patient)
                except PatientProfile.DoesNotExist:
                    from rest_framework.exceptions import PermissionDenied

                    raise PermissionDenied(
                        "Você não tem permissão para adicionar anotações para este paciente."
                    )
            else:
                # Se não especificou patient_id, associa ao paciente do contexto (caso padrão)
                from rest_framework.exceptions import ValidationError

                raise ValidationError(
                    {"patient_id": "Este campo é obrigatório para nutricionistas."}
                )
        else:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "Tipo de usuário não tem permissão para criar anotações clínicas."
            )


# Adicionando uma view específica para nutricionistas gerenciarem anotações de pacientes específicos
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def patient_notes_view(request, patient_pk):
    """
    View para nutricionistas gerenciarem anotações clínicas de pacientes específicos.
    GET: Retorna todas as anotações para o paciente
    POST: Cria uma nova anotação para o paciente
    """
    try:
        patient = PatientProfile.objects.get(pk=patient_pk)
    except PatientProfile.DoesNotExist:
        return Response(
            {"error": "Paciente não encontrado"}, status=status.HTTP_404_NOT_FOUND
        )

    # Verificar se o nutricionista tem permissão para acessar este paciente
    if (
        request.user.user_type != "nutricionista"
        or patient.nutritionist != request.user
    ):
        return Response({"error": "Acesso negado"}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        notes = ClinicalNote.objects.filter(patient=patient).order_by("-created_at")
        from .serializers_patient_data import ClinicalNoteSerializer

        serializer = ClinicalNoteSerializer(notes, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        from .serializers_patient_data import ClinicalNoteSerializer

        serializer = ClinicalNoteSerializer(data=request.data)
        if serializer.is_valid():
            # Associar a anotação ao paciente especificado
            serializer.save(patient=patient)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
