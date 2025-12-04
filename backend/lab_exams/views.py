from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import LabExamForm
from patients.models import PatientProfile

@login_required
def lab_exam_upload(request, patient_pk):
    """
    Renderiza e processa o formulário para upload de um novo exame
    laboratorial para um paciente.
    """
    patient = get_object_or_404(PatientProfile.objects.select_related('user'), pk=patient_pk, nutritionist=request.user) # Adicionado select_related
    if request.method == 'POST':
        form = LabExamForm(request.POST, request.FILES)
        if form.is_valid():
            lab_exam = form.save(commit=False)
            lab_exam.patient = patient
            lab_exam.save()
            messages.success(request, 'Exame laboratorial enviado com sucesso!')
            return redirect('patients:detail', pk=patient.pk)
        else:
            messages.error(request, 'Formulário inválido. Corrija os erros.')
    else:
        form = LabExamForm()

    context = {
        'form': form,
        'patient': patient,
    }
    return render(request, 'lab_exams/upload.html', context)