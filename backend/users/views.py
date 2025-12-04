from datetime import datetime, time
from django.utils.timezone import make_aware
from django.utils import timezone
from django.utils import translation

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from patients.models import PatientProfile
from django.core.paginator import Paginator
from .models import User
from appointments.models import Appointment
from diets.models import Diet
import json
from django.views.generic import TemplateView # Importar TemplateView


# @login_required
def dashboard_view(request):
    """
    Exibe o dashboard principal para o nutricionista, incluindo estatísticas
    de pacientes, consultas de hoje, dietas ativas e próxima consulta.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # DEBUG: Se não estiver logado, pega o primeiro usuário do banco
    if not request.user.is_authenticated:
        request.user = User.objects.first()
        
    total_patients = PatientProfile.objects.filter(nutritionist=request.user).count()
    today = timezone.now().date()

    start_of_day = make_aware(datetime.combine(today, time.min))
    end_of_day = make_aware(datetime.combine(today, time.max))

    appointments_today = Appointment.objects.filter(
        user=request.user, date__range=(start_of_day, end_of_day)
    ).select_related('patient__user').order_by("date") # Adicionado select_related
    consultas_hoje = appointments_today.count()
    dietas_ativas = Diet.objects.filter(patient__nutritionist=request.user).count()
    dietas_a_vencer = 0

    proxima_consulta = (
        Appointment.objects.filter(
            user=request.user, date__gte=timezone.now()
        )
        .select_related('patient__user') # Adicionado select_related
        .order_by("date")
        .first()
    )
    
    first_name = request.user.name.split()[0]

    patient_in_focus = (
        PatientProfile.objects.filter(nutritionist=request.user)
        .select_related('user') # Adicionado select_related
        .order_by("-created_at")
        .first()
    )
    if patient_in_focus:
        patient_in_focus.goal = "Perda de Peso"
        patient_in_focus.progress_metric = "-5kg desde o início"

    local_time = timezone.localtime(timezone.now())
    current_hour = local_time.hour
    if current_hour < 12:
        greeting = "manhã"
    elif current_hour < 18:
        greeting = "tarde"
    else:
        greeting = "noite"

    context = {
        "total_patients": total_patients,
        "consultas_hoje": consultas_hoje,
        "appointments_today": appointments_today,
        "dietas_a_vencer": dietas_a_vencer,
        "proxima_consulta": proxima_consulta,
        "first_name": first_name,
        "patient_in_focus": patient_in_focus,
        "greeting": greeting,
        "current_date": timezone.now(),
    }
    translation.activate('pt-br')
    return render(request, "dashboard_moderno.html", context)


@csrf_exempt
def nutricionista_login_view(request):
    """
    Lida com o login de usuários do tipo 'nutricionista'.
    Verifica as credenciais e o tipo de usuário antes de autenticar.
    """
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        try:
            user = User.objects.get(email=email)
            if hasattr(user, "user_type") and user.user_type == "nutricionista":
                if user.check_password(password):
                    if user.is_active:
                        login(request, user)
                        return redirect("users:dashboard")
                    else:
                        messages.error(
                            request, "Conta pendente de aprovação de pagamento."
                        )
                else:
                    messages.error(request, "Email ou senha inválidos.")
            else:
                messages.error(request, "Email ou senha inválidos.")
        except User.DoesNotExist:
            messages.error(request, "Email ou senha inválidos.")
    return render(request, "users/nutricionista_login.html")


def nutricionista_register_view(request):
    """
    Lida com o registro de novos usuários do tipo 'nutricionista'.
    Cria um novo usuário inativo e aguarda aprovação de pagamento.
    """
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password_confirm")
        professional_title = request.POST.get("professional_title")
        gender = request.POST.get("gender")
        if password != password_confirm:
            messages.error(request, "As senhas não coincidem.")
            return render(request, "users/nutricionista_register.html")
        if User.objects.filter(email=email).exists():
            messages.error(request, "Este email já está cadastrado.")
            return render(request, "users/nutricionista_register.html")
        hashed_password = make_password(password)
        User.objects.create(
            name=name,
            email=email,
            password=hashed_password,
            user_type="nutricionista",
            professional_title=professional_title,
            gender=gender,
            is_active=False,
        )
        messages.success(
            request,
            ("Cadastro realizado com sucesso! " "Aguarde a aprovação do pagamento."),
        )
        return redirect("users:nutricionista_login")
    return render(request, "users/nutricionista_register.html")


class PatientLoginTemplateView(TemplateView):
    """
    Renderiza a página de login do paciente usando uma TemplateView para
    maior simplicidade e para seguir as melhores práticas do Django.
    """
    template_name = "users/patient_login.html"

# A lógica de POST da paciente_login_view será movida ou tratada separadamente
# Por enquanto, deixamos a função original, mas a URL apontará para a TemplateView
def paciente_login_view(request):
    """
    Lida com o login de usuários do tipo 'paciente'.
    Verifica as credenciais e o tipo de usuário antes de autenticar.
    """
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        try:
            user = User.objects.get(email=email)
            if hasattr(user, "user_type") and user.user_type == "paciente":
                if user.check_password(password):
                    if user.is_active:
                        login(request, user)
                        return redirect("users:patient_dashboard")
                    else:
                        messages.error(request, "Sua conta de paciente está inativa.")
                else:
                    messages.error(request, "Email ou senha inválidos.")
            else:
                messages.error(request, "Email ou senha inválidos.")
        except User.DoesNotExist:
            messages.error(request, "Email ou senha inválidos.")
    # No modo produção, esta view funcional será eventualmente substituída por uma View
    # que lida tanto com GET (renderiza o formulário) quanto POST (processa o formulário)
    # Por agora, para o teste de renderização, vamos usar a TemplateView.
    # Esta função só será usada se a TemplateView não for suficiente para o teste.
    return render(request, "users/patient_login.html")


def paciente_register_view(request):
    """
    Lida com o registro de novos usuários do tipo 'paciente'.
    Cria um novo usuário ativo.
    """
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password_confirm")
        if password != password_confirm:
            messages.error(request, "As senhas não coincidem.")
            return render(request, "users/patient_register.html")
        if User.objects.filter(email=email).exists():
            messages.error(request, "Este email já está cadastrado.")
            return render(request, "users/patient_register.html")
        hashed_password = make_password(password)
        User.objects.create(
            name=name,
            email=email,
            password=hashed_password,
            user_type="paciente",
            is_active=True,
        )
        messages.success(
            request,
            "Cadastro de paciente realizado com sucesso! Faça login para continuar.",
        )
        return redirect("users:patient_login")
    return render(request, "users/patient_register.html")


@login_required
def resources_view(request):
    """
    Renderiza a página de recursos para usuários logados.
    """
    return render(request, "users/resources.html")


@login_required
def settings_view(request):
    """
    Renderiza a página de configurações para usuários logados.
    """
    return render(request, "users/settings.html")


@login_required
def patient_dashboard_view(request):
    """
    Exibe o dashboard para usuários do tipo 'paciente'.
    """
    first_name = request.user.name.split()[0]
    context = {
        "message": "Bem-vindo ao seu dashboard de paciente!",
        "first_name": first_name,
    }
    return render(request, "users/patient_dashboard.html", context)


def logout_view(request):
    """
    Realiza o logout do usuário e redireciona para a página inicial.
    """
    logout(request)
    return redirect("theme:home")

