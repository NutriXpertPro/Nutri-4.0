from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django import forms

from .forms import EvaluationForm
from .models import Evaluation, EvaluationPhoto
from patients.models import PatientProfile


@login_required
def evaluation_list(request):
    """
    Renderiza a página de listagem de avaliações.
    (Placeholder para futura implementação)
    """
    # Placeholder for listing evaluations
    return render(request, "evaluations/evaluation_list.html")


@login_required
def evaluation_create(request, patient_pk):
    """
    Renderiza e processa o formulário para criar uma nova avaliação física
    para um paciente, incluindo o upload de fotos.
    """
    patient = get_object_or_404(PatientProfile.objects.select_related('user'), pk=patient_pk, nutritionist=request.user) # Adicionado select_related
    if request.method == "POST":
        form = EvaluationForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            evaluation = form.save(commit=False)
            evaluation.patient = patient
            evaluation.save()

            # Handle photo uploads
            photos_to_create = []
            if 'photo_front' in request.FILES:
                photos_to_create.append(
                    EvaluationPhoto(evaluation=evaluation, image=request.FILES['photo_front'], label='FRENTE')
                )
            if 'photo_side' in request.FILES:
                photos_to_create.append(
                    EvaluationPhoto(evaluation=evaluation, image=request.FILES['photo_side'], label='LADO')
                )
            if 'photo_back' in request.FILES:
                photos_to_create.append(
                    EvaluationPhoto(evaluation=evaluation, image=request.FILES['photo_back'], label='COSTAS')
                )
            
            if photos_to_create:
                EvaluationPhoto.objects.bulk_create(photos_to_create)

            messages.success(request, "Nova avaliação salva com sucesso!")
            return redirect('patients:detail', pk=patient.pk)
        else:
            messages.error(request, "Formulário inválido. Corrija os erros.")
    else:
        form = EvaluationForm(user=request.user, initial={'patient': patient.pk})
        form.fields['patient'].widget = forms.HiddenInput()

    context = {
        'form': form,
        'patient': patient
    }
    return render(request, 'evaluations/create.html', context)


@login_required
def evaluation_detail_modal(request, pk):
    """
    Exibe os detalhes de uma avaliação física em um modal, incluindo
    as fotos associadas.
    """
    evaluation = get_object_or_404(
        Evaluation.objects.prefetch_related('photos').select_related('patient__user'), # Adicionado select_related
        pk=pk, 
        patient__nutritionist=request.user
    )
    context = {"evaluation": evaluation}
    return render(request, "evaluations/_evaluation_details_partial.html", context)