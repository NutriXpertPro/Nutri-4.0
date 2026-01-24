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

                    # Find substitutions for this item
                    sub_options = []

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

                    item_name_normalized = normalize_text(item.food_name)
                    item_words = get_significant_words(item.food_name)

                    for sub_group in diet_subs:
                        original_name = sub_group.get("original", "")
                        original_normalized = normalize_text(original_name)
                        original_words = get_significant_words(original_name)

                        is_match = False
                        if original_normalized and (
                            original_normalized in item_name_normalized
                            or item_name_normalized in original_normalized
                        ):
                            is_match = True
                        elif any(w in item_words for w in original_words):
                            is_match = True

                        if is_match:
                            print(
                                f"DEBUG: MATCH ENCONTRADO para {item.food_name} com regra {original_name}!"
                            )
                            for opt in sub_group.get("options", []):
                                sub_options.append(
                                    {
                                        "name": opt.get("name", ""),
                                        "quantity": float(opt.get("quantity", 0)),
                                        "unit": opt.get("unit", item.unit),
                                    }
                                )

                    # === AUTO SUBSTITUTION LOGIC (If no manual subs found) ===
                    if not sub_options:
                        try:
                            from diets.models import AlimentoTACO
                            from django.db.models import Q

                            # 1. Find the food in TACO database - BETTER MATCHING
                            clean_name = "".join(
                                [
                                    i
                                    for i in item.food_name
                                    if i.isalpha() or i.isspace() or i == ','
                                ]
                            ).strip()
                            
                            # Try with full name first
                            taco_match = AlimentoTACO.objects.filter(
                                Q(nome__icontains=clean_name) | Q(nome__icontains=clean_name.split(',')[0])
                            ).first()
                            
                            if not taco_match:
                                words = [w for w in clean_name.replace(',', ' ').split() if len(w) > 2]
                                if words:
                                    search_term = " ".join(words[:2])
                                    taco_match = AlimentoTACO.objects.filter(nome__icontains=search_term).first()

                            if taco_match and item_calories > 0:
                                # 2. Determine professional food group
                                def get_professional_group(name, taco_group):
                                    name = (
                                        unicodedata.normalize("NFKD", name)
                                        .encode("ascii", "ignore")
                                        .decode("utf8")
                                        .lower()
                                    )

                                    # Proteínas Magras
                                    if any(x in name for x in ["frango", "peito", "peru", "peixe", "tilapia", "pescada", "atum", "clara", "patinho", "maminha", "lombo", "lagarto", "contra-filé"]):
                                        return "PROTEIN_LEAN"
                                    # Leguminosas
                                    if "leguminosas" in taco_group or any(x in name for x in ["feijao", "feijão", "lentilha", "grao de bico", "grão de bico", "soja", "ervilha"]):
                                        return "LEGUME"
                                    # Carboidratos
                                    if "cereais" in taco_group or "tuberculos" in taco_group or any(x in name for x in ["arroz", "batata", "mandioca", "aipim", "inhame", "cuscuz", "aveia", "milho", "quinoa", "macarrao", "macarrão", "trigo"]):
                                        return "CARB"
                                    # Vegetais Folhosos
                                    if any(x in name for x in ["alface", "rucula", "espinafre", "couve", "acelga", "agriao", "repolho"]):
                                        return "LEAFY"
                                    # Hortaliças
                                    if "verduras" in taco_group or any(x in name for x in ["tomate", "pepino", "abobora", "abobrinha", "brocolis", "vagem", "chuchu", "cenoura", "beterraba"]):
                                        return "VEGGIE"
                                    return "OTHER"

                                item_group = get_professional_group(item.food_name, taco_match.grupo)
                                print(
                                    f"DEBUG: Item '{item.food_name}' classified as group '{item_group}' (TACO group: {taco_match.grupo})"
                                )

                                # 3. Build candidate query
                                candidates_qs = AlimentoTACO.objects.all()

                                # Apply group-specific filters
                                if item_group == "PROTEIN_LEAN":
                                    candidates_qs = candidates_qs.filter(Q(grupo__icontains="carnes") | Q(grupo__icontains="pescados") | Q(grupo__icontains="ovos"))
                                    candidates_qs = candidates_qs.exclude(Q(nome__icontains="picanha") | Q(nome__icontains="acem") | Q(nome__icontains="cupim") | Q(nome__icontains="costela") | Q(nome__icontains="gordura") | Q(nome__icontains="bacon") | Q(nome__icontains="presunto") | Q(nome__icontains="linguica"))
                                elif item_group == "LEGUME":
                                    candidates_qs = candidates_qs.filter(grupo__icontains="leguminosas")
                                elif item_group == "CARB":
                                    candidates_qs = candidates_qs.filter(Q(grupo__icontains="cereais") | Q(grupo__icontains="tuberculos") | Q(nome__icontains="batata") | Q(nome__icontains="mandioca"))
                                elif item_group == "LEAFY":
                                    candidates_qs = candidates_qs.filter(Q(nome__icontains="alface") | Q(nome__icontains="rucula") | Q(nome__icontains="couve"))
                                elif item_group == "VEGGIE":
                                    candidates_qs = candidates_qs.filter(grupo__icontains="verduras").exclude(nome__icontains="alface")
                                else:
                                    candidates_qs = candidates_qs.filter(grupo=taco_match.grupo)

                                # General exclusions
                                candidates_qs = candidates_qs.exclude(Q(nome__icontains="frito") | Q(nome__icontains="industrializado") | Q(nome__icontains="acucarados") | Q(nome__icontains="biscoito"))
                                candidates_qs = candidates_qs.exclude(id=taco_match.id)

                                # 4. Get candidates and Apply Diversity Filter
                                candidates = candidates_qs.order_by("?")[:20]
                                best_candidates = {} # {base_name: candidate}
                                
                                for cand in candidates:
                                    base_name = cand.nome.split(',')[0].strip().lower()
                                    if base_name not in best_candidates:
                                        best_candidates[base_name] = cand
                                    if len(best_candidates) >= 5:
                                        break
                                
                                final_candidates = list(best_candidates.values())

                                # 5. Inject Staples if missing
                                staples = []
                                if item_group == 'CARB':
                                    staples = ['Arroz, integral, cozido', 'Feijão, carioca, cozido', 'Batata, inglesa, cozida']
                                elif item_group == 'PROTEIN_LEAN':
                                    staples = ['Frango, peito, sem pele, grelhado', 'Ovo, de galinha, cozido']
                                
                                for staple_name in staples:
                                    if len(final_candidates) >= 8: break
                                    if not any(staple_name.split(',')[0].lower() in c.nome.lower() for c in final_candidates):
                                        st = AlimentoTACO.objects.filter(nome__icontains=staple_name).first()
                                        if st: final_candidates.append(st)

                                for cand in final_candidates:
                                    # Determinar macro para equivalência
                                    equiv_g = 100.0
                                    
                                    if item_group in ["CARB", "LEGUME", "LEAFY", "VEGGIE"] and cand.carboidrato_g > 1:
                                        # Equivalência por Carboidrato
                                        equiv_g = (item_carbs / cand.carboidrato_g) * 100
                                    elif item_group == "PROTEIN_LEAN" and cand.proteina_g > 1:
                                        # Equivalência por Proteína
                                        equiv_g = (item_protein / cand.proteina_g) * 100
                                    elif cand.energia_kcal > 0:
                                        # Fallback por Calorias
                                        equiv_g = (item_calories / cand.energia_kcal) * 100
                                        
                                    # Fallback se equiv_g for absurdo (ex: divisão por zero ou valor muito baixo)
                                    if equiv_g <= 0:
                                        equiv_g = (item_calories / cand.energia_kcal) * 100 if cand.energia_kcal > 0 else 0

                                    # Calculate proportional macros
                                    ratio = equiv_g / 100
                                    sub_kcal = cand.energia_kcal * ratio
                                    sub_protein = (cand.proteina_g or 0) * ratio
                                    sub_carbs = (cand.carboidrato_g or 0) * ratio
                                    sub_fats = (cand.lipidios_g or 0) * ratio

                                    final_qty = equiv_g
                                    final_unit = "g"

                                    if cand.unidade_caseira and cand.peso_unidade_caseira_g:
                                        qty_household = equiv_g / cand.peso_unidade_caseira_g
                                        if qty_household >= 0.1:
                                            final_qty = qty_household
                                            final_unit = cand.unidade_caseira

                                    sub_options.append({
                                        "name": cand.nome,
                                            "quantity": round(final_qty, 1),
                                            "unit": final_unit,
                                            "kcal": round(sub_kcal, 1),
                                            "protein": round(sub_protein, 1),
                                            "carbs": round(sub_carbs, 1),
                                            "fats": round(sub_fats, 1),
                                            "source": "auto_taco",
                                            "group": cand.grupo,
                                        })

                        except Exception as auto_sub_error:
                            print(
                                f"Auto-Sub Error for {item.food_name}: {str(auto_sub_error)}"
                            )
                    # =========================================================

                    items.append(
                        {
                            "name": item.food_name,
                            "quantity": float(item.quantity),
                            "unit": item.unit,
                            "kcal": item_calories,
                            "protein": item_protein,
                            "carbs": item_carbs,
                            "fats": item_fats,
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
