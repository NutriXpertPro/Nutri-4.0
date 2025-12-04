from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from patients.models import PatientProfile
from .models import Anamnesis
import json


@login_required
def anamnesis_list(request):
    """
    Renderiza a página de listagem de anamneses.
    """
    anamneses = Anamnesis.objects.select_related('patient__user').all()
    return render(request, "anamnesis/list.html", {"anamneses": anamneses})


@login_required
def anamnesis_form(request, patient_id=None):
    """
    Renderiza a página do formulário de anamnese (React component).
    Se patient_id for fornecido, carrega dados existentes para edição.
    """
    anamnesis_data = None
    
    if patient_id:
        try:
            patient = get_object_or_404(PatientProfile, id=patient_id)
            anamnesis = Anamnesis.objects.get(patient=patient)
            # Serializar dados para passar ao React
            anamnesis_data = {
                'nome': anamnesis.nome,
                'idade': anamnesis.idade,
                'sexo': anamnesis.sexo,
                # ... outros campos
            }
        except Anamnesis.DoesNotExist:
            anamnesis_data = None
    
    # Obter dados do paciente para preencher o formulário
    patient_name = ""
    patient_email = ""
    if patient_id:
        try:
            patient = PatientProfile.objects.get(id=patient_id)
            patient_name = patient.user.name
            patient_email = patient.user.email
        except PatientProfile.DoesNotExist:
            pass

    return render(request, "anamnesis/form.html", {
        "patient_id": patient_id,
        "patient_name": patient_name,
        "patient_email": patient_email,
        "anamnesis_data": json.dumps(anamnesis_data) if anamnesis_data else None
    })


@login_required
@require_http_methods(["POST"])
def anamnesis_submit(request):
    """
    API endpoint para salvar/atualizar anamnese.
    Recebe dados JSON do formulário React e salva no banco.
    """
    try:
        data = json.loads(request.body)
        patient_id = data.get('patient_id')
        
        # Validar e salvar
        # TODO: Implementar lógica de salvamento completa
        
        return JsonResponse({
            'success': True,
            'message': 'Anamnese salva com sucesso!'
        })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["GET"])
def get_patient_restrictions(request, patient_id):
    """
    API endpoint para buscar restrições alimentares e intolerâncias da anamnese do paciente.
    Retorna lista de restrições para popular automaticamente no formulário de dieta.
    """
    try:
        patient = get_object_or_404(PatientProfile, id=patient_id)
        
        try:
            anamnesis = Anamnesis.objects.get(patient=patient)
            
            # Coletar restrições e intolerâncias
            restricoes = []
            
            # Alimentos restritos (separados por vírgula ou ponto-e-vírgula)
            if anamnesis.alimentos_restritos:
                restricoes.extend([r.strip() for r in anamnesis.alimentos_restritos.replace(';', ',').split(',') if r.strip()])
            
            # Intolerâncias
            if anamnesis.intolerancia and anamnesis.intolerancia_detalhes:
                restricoes.extend([i.strip() for i in anamnesis.intolerancia_detalhes.replace(';', ',').split(',') if i.strip()])
            
            return JsonResponse({
                'success': True,
                'restrictions': restricoes,
                'patient_name': patient.user.name
            })
            
        except Anamnesis.DoesNotExist:
            return JsonResponse({
                'success': True,
                'restrictions': [],
                'message': 'Nenhuma anamnese encontrada para este paciente'
            })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
