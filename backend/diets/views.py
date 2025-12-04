from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .forms import DietForm
from .models import Diet, Meal, FoodItem, AlimentoTACO, AlimentoTBCA, AlimentoUSDA
from patients.models import PatientProfile
import json

# @login_required
def diet_list(request):
    """
    Exibe uma lista paginada de todas as dietas criadas pelo nutricionista
    logado, com opções de busca e filtro por paciente.
    """
    from django.core.paginator import Paginator
    from django.db.models import Q
    from datetime import datetime, timedelta
    from django.contrib.auth import get_user_model

    User = get_user_model()
    
    # DEBUG: Se não estiver logado, pega o primeiro usuário do banco
    if not request.user.is_authenticated:
        nutritionist = User.objects.first()
    else:
        nutritionist = request.user
    
    # Get all diets for current user
    diets_queryset = Diet.objects.filter(patient__nutritionist=nutritionist).select_related('patient__user').order_by('-created_at')
    
    # Search functionality
    search_query = request.GET.get('search')
    if search_query:
        diets_queryset = diets_queryset.filter(
            Q(name__icontains=search_query) | 
            Q(patient__user__name__icontains=search_query)
        )
    
    # Patient filter
    patient_filter = request.GET.get('patient')
    if patient_filter:
        diets_queryset = diets_queryset.filter(patient_id=patient_filter)
    
    # Pagination
    paginator = Paginator(diets_queryset, 12)  # 12 diets per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Statistics
    total_diets = diets_queryset.count()
    active_diets = total_diets  # All diets are considered active for now
    
    # This week's diets
    week_start = datetime.now() - timedelta(days=7)
    this_week_diets = Diet.objects.filter(
        patient__nutritionist=nutritionist,
        created_at__gte=week_start
    ).count()
    
    # Get patients for filter dropdown
    patients = PatientProfile.objects.filter(nutritionist=nutritionist).select_related('user')
    
    context = {
        'diets': page_obj,
        'patients': patients,
        'total_diets': total_diets,
        'active_diets': active_diets,
        'this_week_diets': this_week_diets,
        'is_paginated': page_obj.has_other_pages(),
        'page_obj': page_obj,
    }
    
    return render(request, "diets/diet_list.html", context)


from django.db import IntegrityError

# ... (código existente) ...

@login_required
def diet_create(request, patient_pk=None):
    """
    Renderiza e processa o formulário de criação de uma nova dieta.
    Permite a criação de um plano alimentar detalhado com refeições e
    substituições, associado a um paciente.
    """
    import json
    from django.http import JsonResponse
    
    # Buscar todos os pacientes do nutricionista
    patients = PatientProfile.objects.filter(nutritionist=request.user).select_related('user')
    
    patient = None
    if patient_pk:
        patient = get_object_or_404(PatientProfile, pk=patient_pk, nutritionist=request.user)

    if request.method == "POST":
        try:
            patient_id = request.POST.get('patient')
            name = request.POST.get('name')
            meals_json = request.POST.get('meals')
            substitutions_json = request.POST.get('substitutions', '[]')
            meta_calorias = request.POST.get('meta_calorias')
            meta_carboidratos = request.POST.get('meta_carboidratos')
            meta_proteinas = request.POST.get('meta_proteinas')
            meta_gorduras = request.POST.get('meta_gorduras')
            
            # Validações
            if not patient_id or not name or not meals_json:
                raise ValueError("Dados obrigatórios não fornecidos")
            
            patient_obj = PatientProfile.objects.get(id=patient_id, nutritionist=request.user)
            meals_data = json.loads(meals_json)
            substitutions_data = json.loads(substitutions_json)
            
            # Criar dieta
            diet = Diet.objects.create(
                patient=patient_obj,
                name=name,
                meals=meals_data,
                substitutions=substitutions_data,
                meta_calorias=int(float(meta_calorias)) if meta_calorias else None,
                meta_carboidratos=int(float(meta_carboidratos)) if meta_carboidratos else None,
                meta_proteinas=int(float(meta_proteinas)) if meta_proteinas else None,
                meta_gorduras=int(float(meta_gorduras)) if meta_gorduras else None,
            )
            
            messages.success(request, "Plano alimentar criado com sucesso!")
            return redirect('diets:detail', pk=diet.pk)
            
        except ValueError as e:
            messages.error(request, f'Erro de validação: {str(e)}')
        except PatientProfile.DoesNotExist:
            messages.error(request, 'Paciente não encontrado.')
        except json.JSONDecodeError:
            messages.error(request, 'Formato de dados JSON inválido para refeições ou substituições.')
        except IntegrityError:
            messages.error(request, 'Erro de integridade ao salvar a dieta. Verifique os dados.')
        except Exception as e:
            messages.error(request, f'Ocorreu um erro inesperado: {str(e)}')

    context = {
        "patients": patients,
        "patient": patient
    }
    return render(request, "diets/diet_create.html", context)


@login_required
def diet_detail(request, pk):
    """
    Exibe os detalhes de uma dieta específica.
    """
    diet = get_object_or_404(
        Diet.objects.select_related('patient__user'), pk=pk, patient__nutritionist=request.user # Adicionado select_related
    )
    context = {"diet": diet}
    return render(request, "diets/detail.html", context)


@login_required
def diet_detail_modal(request, pk):
    """
    Exibe os detalhes de uma dieta em um modal, ideal para visualizações
    rápidas sem sair da página principal.
    """
    diet = get_object_or_404(
        Diet.objects.select_related('patient__user'), pk=pk, patient__nutritionist=request.user # Adicionado select_related
    )
    context = {"diet": diet}
    return render(request, "diets/_diet_details_partial.html", context)


# ===== ENDPOINTS AJAX =====

from django.views.decorators.cache import cache_page

@login_required
@cache_page(60 * 15)  # Cache por 15 minutos
def buscar_alimentos(request):
    """
    Endpoint AJAX para buscar alimentos em múltiplas tabelas (TACO, TBCA, USDA).
    Aceita parâmetro 'source' para filtrar por tabela: taco, tbca, usda, ou all.
    """
    from django.http import JsonResponse
    from .models import AlimentoTACO, AlimentoTBCA, AlimentoUSDA
    from django.db.models import Q
    
    query = request.GET.get('q', '').lower().strip()
    source = request.GET.get('source', 'taco').lower()  # Padrão: TACO
    
    if len(query) < 2:
        return JsonResponse({'results': []})
    
    resultados = []
    
    # Buscar em TACO
    if source in ['taco', 'all']:
        limit = 10 if source == 'taco' else 5
        alimentos_taco = AlimentoTACO.objects.filter(
            Q(nome__icontains=query) | Q(grupo__icontains=query)
        )[:limit]
        
        for alimento in alimentos_taco:
            resultados.append({
                'id': f'taco-{alimento.id}',
                'source': 'TACO',
                'nome': alimento.nome,
                'calorias': alimento.calorias,
                'proteinas': alimento.proteinas,
                'carboidratos': alimento.carboidratos,
                'gorduras': alimento.gorduras,
                'grupo': alimento.grupo,
                'unidade_caseira': alimento.unidade_caseira,
                'peso_unidade_caseira': alimento.peso_unidade_caseira_g
            })
    
    # Buscar em TBCA
    if source in ['tbca', 'all']:
        limit = 10 if source == 'tbca' else 5
        alimentos_tbca = AlimentoTBCA.objects.filter(
            Q(nome__icontains=query) | Q(grupo__icontains=query)
        )[:limit]
        
        for alimento in alimentos_tbca:
            resultados.append({
                'id': f'tbca-{alimento.id}',
                'source': 'TBCA',
                'nome': alimento.nome,
                'calorias': alimento.energia_kcal,
                'proteinas': alimento.proteina_g,
                'carboidratos': alimento.carboidrato_g,
                'gorduras': alimento.lipidios_g,
                'grupo': alimento.grupo,
                'unidade_caseira': 'g',
                'peso_unidade_caseira': 100
            })
    
    # Buscar em USDA
    if source in ['usda', 'all']:
        limit = 10 if source == 'usda' else 5
        alimentos_usda = AlimentoUSDA.objects.filter(
            Q(nome__icontains=query) | Q(categoria__icontains=query)
        )[:limit]
        
        for alimento in alimentos_usda:
            resultados.append({
                'id': f'usda-{alimento.fdc_id}',
                'source': 'USDA',
                'nome': alimento.nome,
                'calorias': alimento.energia_kcal,
                'proteinas': alimento.proteina_g,
                'carboidratos': alimento.carboidrato_g,
                'gorduras': alimento.lipidios_g,
                'grupo': alimento.categoria,
                'unidade_caseira': 'g',
                'peso_unidade_caseira': alimento.porcao_padrao_g
            })
    
    return JsonResponse({'results': resultados})


@login_required
def calcular_necessidades(request):
    """
    Endpoint AJAX para calcular as necessidades calóricas de um paciente
    com base em diferentes fórmulas (Harris-Benedict, Mifflin-St Jeor, etc.).
    """
    from django.http import JsonResponse
    import json
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            peso = float(data.get('peso'))
            altura = float(data.get('altura'))
            idade = int(data.get('idade'))
            sexo = data.get('sexo')
            formula = data.get('formula')
            nivel_atividade = float(data.get('nivel_atividade'))
            objetivo = data.get('objetivo')
            
            # Calcular TMB
            if formula == 'harris-benedict':
                if sexo == 'M':
                    tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade)
                else:
                    tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade)
            elif formula == 'mifflin-st-jeor':
                if sexo == 'M':
                    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5
                else:
                    tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161
            elif formula == 'katch-mcardle':
                massa_magra = peso * 0.85  # Assumindo 15% de gordura
                tmb = 370 + (21.6 * massa_magra)
            
            # Calcular GCDT
            gcdt = tmb * nivel_atividade
            
            # Aplicar objetivo
            if objetivo == 'perder':
                meta_final = gcdt - 500
            elif objetivo == 'ganhar':
                meta_final = gcdt + 500
            else:
                meta_final = gcdt
            
            return JsonResponse({
                'success': True,
                'tmb': round(tmb),
                'gcdt': round(gcdt),
                'meta_final': round(meta_final)
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Formato JSON inválido.'})
        except (ValueError, TypeError) as e:
            return JsonResponse({'success': False, 'error': f'Dados de entrada inválidos: {str(e)}'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Ocorreu um erro inesperado: {str(e)}'})
    
    return JsonResponse({'success': False, 'error': 'Método não permitido'})


@login_required
def gerar_cardapio_ia(request):
    """
    Endpoint AJAX que simula a geração de um cardápio alimentar usando IA.
    Em um ambiente de produção, esta função se integraria com uma API externa.
    """
    from django.http import JsonResponse
    import json
    import random
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Simular geração de cardápio (em produção usaria Claude API)
            num_refeicoes = int(data.get('numRefeicoes', 5))
            meta_calorias = data.get('metaCalorias', 2000)
            vegetariano = data.get('vegetariano', False)
            vegano = data.get('vegano', False)
            
            # Templates de refeições
            refeicoes_base = [
                {'nome': 'Café da Manhã', 'horario': '07:00'},
                {'nome': 'Lanche da Manhã', 'horario': '10:00'},
                {'nome': 'Almoço', 'horario': '12:30'},
                {'nome': 'Lanche da Tarde', 'horario': '15:30'},
                {'nome': 'Jantar', 'horario': '19:00'},
                {'nome': 'Ceia', 'horario': '21:30'},
            ]
            
            # Alimentos por categoria
            if vegano:
                alimentos_cafe = ['Aveia em flocos', 'Banana nanica', 'Castanhas']
                alimentos_almoco = ['Arroz integral', 'Feijão preto', 'Brócolis']
            elif vegetariano:
                alimentos_cafe = ['Aveia em flocos', 'Leite desnatado', 'Banana nanica']
                alimentos_almoco = ['Arroz branco', 'Feijão preto', 'Ovo de galinha']
            else:
                alimentos_cafe = ['Pão integral', 'Leite desnatado', 'Banana nanica']
                alimentos_almoco = ['Arroz branco', 'Frango grelhado', 'Batata doce']
            
            # Gerar cardápio
            cardapio = []
            calorias_por_refeicao = meta_calorias // num_refeicoes
            
            for i in range(num_refeicoes):
                refeicao = refeicoes_base[i].copy()
                
                if 'Café' in refeicao['nome']:
                    alimentos = random.sample(alimentos_cafe, min(2, len(alimentos_cafe)))
                else:
                    alimentos = random.sample(alimentos_almoco, min(3, len(alimentos_almoco)))
                
                refeicao['alimentos'] = [
                    {'nome': alimento, 'quantidade': random.randint(80, 150)}
                    for alimento in alimentos
                ]
                
                cardapio.append(refeicao)
            
            return JsonResponse({
                'success': True,
                'cardapio': cardapio,
                'message': 'Cardápio gerado com sucesso!'
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Formato JSON inválido.'})
        except (ValueError, TypeError) as e:
            return JsonResponse({'success': False, 'message': f'Dados de entrada inválidos: {str(e)}'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Ocorreu um erro inesperado: {str(e)}'})
    
    return JsonResponse({'success': False, 'message': 'Método não permitido'})


@login_required
def gerar_substituicoes(request):
    """
    Endpoint AJAX que gera uma lista de substituições para um conjunto
    de alimentos, com base em uma base de dados simplificada.
    """
    from django.http import JsonResponse
    import json
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            alimentos = data.get('alimentos', [])
            
            # Base de dados de substituições (simplificada)
            substituicoes_db = {
                'Arroz branco cozido': [
                    {'nome': 'Arroz integral', 'equivalencia': '100g'},
                    {'nome': 'Quinoa', 'equivalencia': '80g'},
                    {'nome': 'Batata doce', 'equivalencia': '120g'}
                ],
                'Frango grelhado': [
                    {'nome': 'Peixe grelhado', 'equivalencia': '100g'},
                    {'nome': 'Carne bovina magra', 'equivalencia': '90g'},
                    {'nome': 'Tofu', 'equivalencia': '150g'}
                ],
                'Leite desnatado': [
                    {'nome': 'Leite de amêndoas', 'equivalencia': '200ml'},
                    {'nome': 'Iogurte natural', 'equivalencia': '150ml'},
                    {'nome': 'Leite de aveia', 'equivalencia': '200ml'}
                ]
            }
            
            resultado = {}
            for alimento in alimentos:
                if alimento in substituicoes_db:
                    resultado[alimento] = substituicoes_db[alimento]
            
            return JsonResponse({
                'success': True,
                'substituicoes': resultado
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Formato JSON inválido.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Ocorreu um erro inesperado: {str(e)}'})
    
    return JsonResponse({'success': False, 'error': 'Método não permitido'})


@login_required
def gerar_pdf(request, patient_id):
    """
    Gera um PDF do plano alimentar mais recente de um paciente,
    incluindo dados do paciente, metas, refeições e substituições.
    """
    from django.http import HttpResponse
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    import json
    
    try:
        patient = get_object_or_404(PatientProfile.objects.select_related('user'), pk=patient_id, nutritionist=request.user) # Adicionado select_related
        
        # Buscar última dieta do paciente
        diet = Diet.objects.filter(patient=patient).order_by('-created_at').first()
        
        if not diet:
            return HttpResponse("Nenhuma dieta encontrada para este paciente.", status=404)
        
        # Criar PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="plano_alimentar_{patient.user.name}.pdf"'
        
        doc = SimpleDocTemplate(response, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Título
        story.append(Paragraph(f"PLANO ALIMENTAR - {patient.user.name.upper()}", styles['Title']))
        story.append(Spacer(1, 20))
        
        # Dados do paciente
        story.append(Paragraph("DADOS DO PACIENTE", styles['Heading2']))
        patient_data = [
            ['Nome:', patient.user.name],
            ['Peso:', f"{getattr(patient, 'weight', 'N/A')} kg"],
            ['Altura:', f"{getattr(patient, 'height', 'N/A')} cm"],
            ['Idade:', f"{getattr(patient, 'age', 'N/A')} anos"],
        ]
        
        patient_table = Table(patient_data, colWidths=[100, 200])
        patient_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 20))
        
        # Metas nutricionais
        if hasattr(diet, 'meta_calorias') and diet.meta_calorias:
            story.append(Paragraph("METAS NUTRICIONAIS", styles['Heading2']))
            metas_data = [
                ['Calorias:', f"{diet.meta_calorias} kcal"],
                ['Carboidratos:', f"{diet.meta_carboidratos}g" if diet.meta_carboidratos else 'N/A'],
                ['Proteínas:', f"{diet.meta_proteinas}g" if diet.meta_proteinas else 'N/A'],
                ['Gorduras:', f"{diet.meta_gorduras}g" if diet.meta_gorduras else 'N/A'],
            ]
            
            metas_table = Table(metas_data, colWidths=[100, 200])
            metas_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(metas_table)
            story.append(Spacer(1, 20))
        
        # Refeições
        story.append(Paragraph("REFEIÇÕES", styles['Heading2']))
        
        for meal in diet.meals:
            story.append(Paragraph(f"{meal.get('nome', 'Refeição')} - {meal.get('horario', 'Horário não definido')}", styles['Heading3']))
            
            if 'alimentos' in meal:
                for alimento in meal['alimentos']:
                    story.append(Paragraph(f"• {alimento.get('nome', 'Alimento')} - {alimento.get('quantidade', 'N/A')} {alimento.get('unidade', 'g')}", styles['Normal']))
            
            story.append(Spacer(1, 10))
        
        # Substituições
        if diet.substitutions:
            story.append(Paragraph("SUBSTITUIÇÕES", styles['Heading2']))
            for sub in diet.substitutions:
                story.append(Paragraph(f"• {sub.get('original', 'Alimento')}", styles['Normal']))
                if 'options' in sub:
                    for option in sub['options']:
                        story.append(Paragraph(f"  - {option.get('name', 'Substituto')}: {option.get('quantity', 'N/A')}", styles['Normal']))
                story.append(Spacer(1, 5))
        
        # Rodapé
        story.append(Spacer(1, 30))
        story.append(Paragraph("Este plano alimentar foi elaborado especificamente para você. Siga as orientações e consulte seu nutricionista regularmente.", styles['Normal']))
        
        doc.build(story)
        return response
        
    except Http404: # get_object_or_404 raises Http404
        return HttpResponse("Paciente ou dieta não encontrados.", status=404)
    except json.JSONDecodeError:
        return HttpResponse("Erro ao processar dados JSON da dieta.", status=500)
    except Exception as e:
        return HttpResponse(f"Erro inesperado ao gerar PDF: {str(e)}", status=500)


@login_required
def plano_alimentar(request):
    """
    View para o plano alimentar avançado com tema compatível com dashboard
    """
    return render(request, 'diets/plano_alimentar.html')


# ===== ENDPOINTS PARA ALIMENTOS CUSTOMIZADOS =====

@login_required
def criar_alimento_customizado(request):
    """
    Endpoint para criar um novo alimento customizado
    """
    from django.http import JsonResponse
    from .models import AlimentoCustomizado
    import json
    
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        alimento = AlimentoCustomizado.objects.create(
            nutritionist=request.user,
            nome=data.get('nome', ''),
            categoria=data.get('categoria', 'Outros'),
            energia_kcal=float(data.get('energia_kcal', 0)),
            proteina_g=float(data.get('proteina_g', 0)),
            carboidrato_g=float(data.get('carboidrato_g', 0)),
            lipidios_g=float(data.get('lipidios_g', 0)),
            fibra_g=float(data.get('fibra_g', 0)),
            sodio_mg=float(data.get('sodio_mg', 0)),
            ferro_mg=float(data.get('ferro_mg', 0)),
            calcio_mg=float(data.get('calcio_mg', 0)),
            vitamina_c_mg=float(data.get('vitamina_c_mg', 0)),
            porcao=float(data.get('porcao', 100)),
            unidade=data.get('unidade', 'g')
        )
        
        return JsonResponse({
            'success': True,
            'alimento': {
                'id': alimento.id,
                'nome': alimento.nome,
                'categoria': alimento.categoria,
                'calorias': alimento.energia_kcal,
                'proteinas': alimento.proteina_g,
                'carboidratos': alimento.carboidrato_g,
                'gorduras': alimento.lipidios_g,
                'fibras': alimento.fibra_g,
                'sodio': alimento.sodio_mg,
                'ferro': alimento.ferro_mg,
                'calcio': alimento.calcio_mg,
                'porcao': alimento.porcao,
                'unidade': alimento.unidade,
                'customizado': True
            }
        })
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def editar_alimento_customizado(request, alimento_id):
    """
    Endpoint para editar um alimento customizado existente
    """
    from django.http import JsonResponse
    from .models import AlimentoCustomizado
    import json
    
    if request.method != 'PUT':
        return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)
    
    try:
        alimento = get_object_or_404(AlimentoCustomizado, id=alimento_id, nutritionist=request.user)
        data = json.loads(request.body)
        
        alimento.nome = data.get('nome', alimento.nome)
        alimento.categoria = data.get('categoria', alimento.categoria)
        alimento.energia_kcal = float(data.get('energia_kcal', alimento.energia_kcal))
        alimento.proteina_g = float(data.get('proteina_g', alimento.proteina_g))
        alimento.carboidrato_g = float(data.get('carboidrato_g', alimento.carboidrato_g))
        alimento.lipidios_g = float(data.get('lipidios_g', alimento.lipidios_g))
        alimento.fibra_g = float(data.get('fibra_g', alimento.fibra_g))
        alimento.sodio_mg = float(data.get('sodio_mg', alimento.sodio_mg))
        alimento.ferro_mg = float(data.get('ferro_mg', alimento.ferro_mg))
        alimento.calcio_mg = float(data.get('calcio_mg', alimento.calcio_mg))
        alimento.vitamina_c_mg = float(data.get('vitamina_c_mg', alimento.vitamina_c_mg))
        alimento.porcao = float(data.get('porcao', alimento.porcao))
        alimento.unidade = data.get('unidade', alimento.unidade)
        alimento.save()
        
        return JsonResponse({
            'success': True,
            'alimento': {
                'id': alimento.id,
                'nome': alimento.nome,
                'categoria': alimento.categoria,
                'calorias': alimento.energia_kcal,
                'proteinas': alimento.proteina_g,
                'carboidratos': alimento.carboidrato_g,
                'gorduras': alimento.lipidios_g,
                'fibras': alimento.fibra_g,
                'sodio': alimento.sodio_mg,
                'ferro': alimento.ferro_mg,
                'calcio': alimento.calcio_mg,
                'porcao': alimento.porcao,
                'unidade': alimento.unidade,
                'customizado': True
            }
        })
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def deletar_alimento_customizado(request, alimento_id):
    """
    Endpoint para deletar um alimento customizado
    """
    from django.http import JsonResponse
    from .models import AlimentoCustomizado
    
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'error': 'Método não permitido'}, status=405)
    
    try:
        alimento = get_object_or_404(AlimentoCustomizado, id=alimento_id, nutritionist=request.user)
        alimento.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ===== NOVA VIEW PARA SISTEMA AVANÇADO DE DIETAS (REACT/VITE) =====

from .models import Meal, FoodItem

# @login_required  # TEMPORARIAMENTE DESATIVADO PARA TESTE
def create_diet_view(request):
    """View para renderizar a página de criação de dieta com React/Vite."""
    if request.method == 'POST':
        try:
            # Processar dados do formulário
            patient_id = request.POST.get('patient')
            name = request.POST.get('name')
            goal = request.POST.get('goal')
            
            # Dados avançados (JSON do React)
            advanced_data_str = request.POST.get('advanced_data', '{}')
            advanced_data = json.loads(advanced_data_str)
            
            patient = get_object_or_404(PatientProfile, id=patient_id, nutritionist=request.user)
            
            # Criar dieta
            diet = Diet.objects.create(
                patient=patient,
                name=name or 'Nova Dieta',
                goal=goal,
                tmb=advanced_data.get('tmb'),
                gcdt=advanced_data.get('gcdt'),
                target_calories=advanced_data.get('target_calories'),
                diet_type=advanced_data.get('diet_type', 'balanced'),
                calculation_method=advanced_data.get('calculation_method', 'mifflin'),
                target_protein=advanced_data.get('target_protein'),
                target_carbs=advanced_data.get('target_carbs'),
                target_fats=advanced_data.get('target_fats')
            )
            
            # Criar refeições e itens
            meals_data = advanced_data.get('meals', [])
            for meal_data in meals_data:
                meal = Meal.objects.create(
                    diet=diet,
                    name=meal_data.get('name'),
                    time=meal_data.get('time'),
                    day_of_week=meal_data.get('day_of_week', 0),
                    order=meal_data.get('order', 0),
                    notes=meal_data.get('notes', '')
                )
                
                for item_data in meal_data.get('items', []):
                    FoodItem.objects.create(
                        meal=meal,
                        food_name=item_data.get('food_name'),
                        quantity=item_data.get('quantity'),
                        unit=item_data.get('unit'),
                        calories=item_data.get('calories'),
                        protein=item_data.get('protein'),
                        carbs=item_data.get('carbs'),
                        fats=item_data.get('fats'),
                        fiber=item_data.get('fiber', 0)
                    )
            
            messages.success(request, f'Dieta "{name}" criada com sucesso!')
            return redirect('diets:detail', pk=diet.pk)
            
        except PatientProfile.DoesNotExist:
            messages.error(request, 'Paciente não encontrado.')
        except json.JSONDecodeError:
            messages.error(request, 'Erro ao processar dados da dieta.')
        except Exception as e:
            messages.error(request, f'Erro ao criar dieta: {str(e)}')
    
    # GET request - renderizar formulário
    if not request.user.is_authenticated:
        # MODO TESTE: dados mock quando não logado
        patients_json = json.dumps([
            {
                'id': 1,
                'nome': 'Maria Silva (TESTE)',
                'peso': 65,
                'altura': 165,
                'idade': 27,
                'sexo': 'F'
            }
        ])
        context = {
            'patients': [],
            'patients_json': patients_json,
        }
        return render(request, 'diets/diet_create.html', context)
    
    # Usuário autenticado - dados reais
    patients = PatientProfile.objects.filter(nutritionist=request.user).select_related('user')
    patients_json = json.dumps([
        {
            'id': p.id,
            'nome': p.user.name,
            'peso': p.weight if hasattr(p, 'weight') else 70,
            'altura': p.height if hasattr(p, 'height') else 170,
            'idade': p.age if hasattr(p, 'age') else 30,
            'sexo': p.gender if hasattr(p, 'gender') else 'F'
        }
        for p in patients
    ])
    
    context = {
        'patients': patients,
        'patients_json': patients_json,
    }
    
    return render(request, 'diets/diet_create.html', context)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_food_database(request):
    """API endpoint para buscar alimentos da base TACO/TBCA/USDA."""
    from django.db.models import Q
    
    search = request.GET.get('search', '').strip()
    source = request.GET.get('source', 'taco')
    limit = int(request.GET.get('limit', 20))
    
    if len(search) < 2:
        return Response({'foods': []})
    
    foods = []
    
    # Buscar em TACO
    if source in ['taco', 'all']:
        taco_foods = AlimentoTACO.objects.filter(
            Q(nome__icontains=search) | Q(grupo__icontains=search)
        )[:limit]
        
        for food in taco_foods:
            foods.append({
                'id': f'taco-{food.id}',
                'nome': food.nome,
                'categoria': food.grupo,
                'calorias': food.energia_kcal,
                'proteinas': food.proteina_g,
                'carboidratos': food.carboidrato_g,
                'gorduras': food.lipidios_g,
                'fibras': food.fibra_g,
                'sodio': food.sodio_mg or 0,
                'ferro': food.ferro_mg or 0,
                'calcio': food.calcio_mg or 0,
                'porcao': 100,
                'unidade': 'g',
                'source': 'TACO'
            })
    
    # Buscar em TBCA
    if source in ['tbca', 'all']:
        tbca_foods = AlimentoTBCA.objects.filter(
            Q(nome__icontains=search) | Q(grupo__icontains=search)
        )[:limit]
        
        for food in tbca_foods:
            foods.append({
                'id': f'tbca-{food.id}',
                'nome': food.nome,
                'categoria': food.grupo,
                'calorias': food.energia_kcal,
                'proteinas': food.proteina_g,
                'carboidratos': food.carboidrato_g,
                'gorduras': food.lipidios_g,
                'fibras': food.fibra_g or 0,
                'sodio': food.sodio_mg or 0,
                'ferro': food.ferro_mg or 0,
                'calcio': food.calcio_mg or 0,
                'porcao': 100,
                'unidade': 'g',
                'source': 'TBCA'
            })
    
    # Buscar em USDA
    if source in ['usda', 'all']:
        usda_foods = AlimentoUSDA.objects.filter(
            Q(nome__icontains=search) | Q(categoria__icontains=search)
        )[:limit]
        
        for food in usda_foods:
            foods.append({
                'id': f'usda-{food.fdc_id}',
                'nome': food.nome,
                'categoria': food.categoria,
                'calorias': food.energia_kcal,
                'proteinas': food.proteina_g,
                'carboidratos': food.carboidrato_g,
                'gorduras': food.lipidios_g,
                'fibras': food.fibra_g or 0,
                'sodio': food.sodio_mg or 0,
                'ferro': food.ferro_mg or 0,
                'calcio': food.calcio_mg or 0,
                'porcao': food.porcao_padrao_g,
                'unidade': 'g',
                'source': 'USDA'
            })
    
    return Response({'foods': foods[:limit]})

