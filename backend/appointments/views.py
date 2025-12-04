from django.shortcuts import render, redirect, get_object_or_404
from datetime import datetime
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Appointment
from .forms import AppointmentForm


@login_required
def appointment_list(request):
    """
    Exibe a lista de todas as consultas agendadas para os pacientes
    do nutricionista logado.
    """
    appointments = Appointment.objects.filter(
        patient__nutritionist=request.user
    ).select_related('patient__user').order_by("-date") # Adicionado select_related
    context = {"appointments": appointments}
    return render(request, "appointments/list.html", context)


@login_required
def appointment_api_list(request):
    """
    Fornece uma lista de consultas em formato JSON para ser consumida
    por calendários de frontend, como o FullCalendar.
    """
    appointments = Appointment.objects.filter(patient__nutritionist=request.user).select_related('patient__user') # Adicionado select_related
    events = []
    for appointment in appointments:
        events.append(
            {
                "title": appointment.patient.user.name,
                "start": appointment.date.isoformat(),
                "url": f"/patients/{appointment.patient.id}/",
            }
        )
    return JsonResponse(events, safe=False)


@login_required
def appointment_create(request, patient_pk=None):
    """
    Renderiza e processa o formulário para agendar uma nova consulta
    para um paciente.
    """
    if request.method == "POST":
        form = AppointmentForm(request.POST, user=request.user)
        if form.is_valid():
            patient = form.cleaned_data["patient"]
            date = form.cleaned_data["date"]
            time = form.cleaned_data["time"]
            notes = form.cleaned_data["notes"]

            appointment_datetime = datetime.combine(date, time)

            Appointment.objects.create(
                user=request.user,
                patient=patient,
                date=appointment_datetime,
                notes=notes
            )

            messages.success(request, "Consulta agendada com sucesso!")
            return redirect("appointments:list")
    else:
        initial_data = {}
        date_str = request.GET.get("date")
        if date_str:
            initial_data["date"] = date_str
        
        if patient_pk:
            initial_data["patient"] = patient_pk

        form = AppointmentForm(initial=initial_data, user=request.user)

    context = {"form": form}
    return render(request, "appointments/create.html", context)


@login_required
def appointment_detail(request, pk):
    """
    Exibe os detalhes de uma consulta específica.
    """
    appointment = get_object_or_404(
        Appointment.objects.select_related('patient__user'), pk=pk, patient__nutritionist=request.user # Adicionado select_related
    )
    context = {"appointment": appointment}
    return render(request, "appointments/detail.html", context)


@login_required
def calendar_view(request):
    """
    Renderiza a página do calendário React.
    """
    return render(request, "scheduling/calendar.html")
