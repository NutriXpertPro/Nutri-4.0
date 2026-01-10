from django.db.models.signals import post_save
from django.dispatch import receiver
from notifications.models import Notification
from .models import Anamnesis, AnamnesisResponse

@receiver(post_save, sender=Anamnesis)
def sync_anamnesis_data(sender, instance, created, **kwargs):
    """
    Sincroniza os dados da anamnese com o perfil do paciente, usuário e avaliações.
    """
    patient = instance.patient
    user = patient.user
    
    # 1. Sincronizar dados básicos do Usuário
    user_updated = False
    if instance.nome and user.name != instance.nome:
        user.name = instance.nome
        user_updated = True
    
    gender_map = {'Masculino': 'M', 'Feminino': 'F', 'Outro': None}
    new_gender = gender_map.get(instance.sexo)
    if new_gender and user.gender != new_gender:
        user.gender = new_gender
        user_updated = True
    
    if user_updated:
        user.save()

    # 2. Sincronizar dados do PatientProfile
    profile_updated = False
    if instance.nascimento and patient.birth_date != instance.nascimento:
        patient.birth_date = instance.nascimento
        profile_updated = True
    
    if instance.telefone and patient.phone != instance.telefone:
        patient.phone = instance.telefone
        profile_updated = True

    # Mapeamento de objetivos (incluindo novos e legados)
    goal_map = {
        'Emagrecimento': 'PERDA_PESO',
        'Ganho de massa muscular': 'GANHO_MUSCULAR',
        'Ganho de peso': 'GANHO_MUSCULAR',
        'Trincar o shape': 'PERDA_PESO'
    }
    
    # Se o objetivo já for uma das chaves padrão do PatientProfile, usamos diretamente.
    # Caso contrário, tentamos o mapeamento legado.
    new_goal = instance.objetivo if instance.objetivo in dict(patient.GOAL_CHOICES) else goal_map.get(instance.objetivo)
    
    if new_goal and patient.goal != new_goal:
        patient.goal = new_goal
        profile_updated = True

    if profile_updated:
        patient.save()

    # 3. Criar ou atualizar Avaliação Física
    if instance.peso or instance.altura:
        from evaluations.models import Evaluation
        from django.utils import timezone
        
        # Procurar uma avaliação de hoje ou criar uma nova "Inicial"
        today = timezone.now().date()
        eval_obj = Evaluation.objects.filter(patient=patient, date__date=today).first()
        
        measurements = eval_obj.body_measurements if eval_obj and eval_obj.body_measurements else {}
        if instance.pescoco: measurements['pescoco'] = float(instance.pescoco)
        if instance.cintura: measurements['cintura'] = float(instance.cintura)
        if instance.quadril: measurements['quadril'] = float(instance.quadril)

        if eval_obj:
            eval_obj.weight = instance.peso
            eval_obj.height = instance.altura
            eval_obj.body_measurements = measurements
            eval_obj.save()
        else:
            Evaluation.objects.create(
                patient=patient,
                date=timezone.now(),
                weight=instance.peso,
                height=instance.altura,
                body_measurements=measurements,
                method='FITA_METRICA' # Padrão para anamnese manual
            )

    # 4. Notificar o nutricionista
    nutritionist = patient.nutritionist
    patient_name = user.name
    
    title = "Anamnese Preenchida"
    message = f"O paciente {patient_name} preencheu a anamnese padrão. [PID:{patient.id}]"
    
    # Evitar notificações duplicadas se for apenas um auto-save frequente
    # Só notifica se for a primeira vez ou se houve mudanças significativas nos campos obrigatórios
    Notification.objects.create(
        user=nutritionist,
        title=title,
        message=message,
        notification_type="system"
    )

@receiver(post_save, sender=AnamnesisResponse)
def notify_nutritionist_custom_anamnesis_saved(sender, instance, created, **kwargs):
    """
    Notifica o nutricionista quando uma anamnese personalizada é respondida.
    """
    if created:
        patient = instance.patient
        nutritionist = patient.nutritionist
        template_title = instance.template.title
        
        patient_name = patient.user.name
        
        title = "Anamnese Personalizada"
        message = f"{patient_name} respondeu ao formulário: {template_title}. [PID:{patient.id}]"
        
        Notification.objects.create(
            user=nutritionist,
            title=title,
            message=message,
            notification_type="system"
        )
