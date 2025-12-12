from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError
from .models import Appointment
from .serializers import AppointmentSerializer
from patients.models import PatientProfile

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar consultas (appointments).
    Inclui todas as operações CRUD e funcionalidades específicas de agendamento.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter appointments for patients belonging to the logged-in nutritionist
        queryset = Appointment.objects.filter(user=self.request.user).select_related('patient__user')

        # Aplicar filtros baseados nos parâmetros da query
        patient_id = self.request.query_params.get('patient')
        status = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        if status:
            queryset = queryset.filter(status=status)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        return queryset

    def perform_create(self, serializer):
        # Validar conflito de horário antes de criar
        date = serializer.validated_data.get('date')
        duration = serializer.validated_data.get('duration', 30)  # padrão 30 minutos

        # Calcular o horário de término
        from datetime import timedelta
        end_time = date + timedelta(minutes=duration)

        # Verificar se há conflitos
        existing_appointments = Appointment.objects.filter(
            user=self.request.user,
            date__lt=end_time,
            date__gt=date - timedelta(minutes=duration)  # Supondo duração mínima de 30 min
        ).exclude(status='cancelada')

        if existing_appointments.exists():
            raise ValidationError(
                'Conflito de horário: já existe uma consulta agendada para este horário.'
            )

        # Salvar o agendamento
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Validar conflito de horário antes de atualizar
        instance = self.get_object()
        new_date = serializer.validated_data.get('date', instance.date)
        new_duration = serializer.validated_data.get('duration', instance.duration or 30)

        # Calcular o horário de término
        from datetime import timedelta
        end_time = new_date + timedelta(minutes=new_duration)

        # Verificar se há conflitos (excluindo o próprio agendamento)
        existing_appointments = Appointment.objects.filter(
            user=self.request.user,
            date__lt=end_time,
            date__gt=new_date - timedelta(minutes=new_duration)
        ).exclude(pk=instance.pk).exclude(status='cancelada')

        if existing_appointments.exists():
            raise ValidationError(
                'Conflito de horário: já existe uma consulta agendada para este horário.'
            )

        # Salvar a atualização
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        # Add any custom logic for deletion if needed
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        # Validações adicionais para atualização
        instance = self.get_object()

        # Verificar se o nutricionista pode atualizar esta consulta
        if instance.user != request.user:
            return Response(
                {'error': 'Você não tem permissão para atualizar esta consulta.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Validações adicionais para atualização parcial
        instance = self.get_object()

        # Verificar se o nutricionista pode atualizar esta consulta
        if instance.user != request.user:
            return Response(
                {'error': 'Você não tem permissão para atualizar esta consulta.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status_action(self, request, pk=None):
        """
        Endpoint para atualizar apenas o status da consulta.
        Exemplo: PATCH /api/v1/appointments/{id}/update-status/
        Body: {"status": "confirmada"}
        """
        appointment = self.get_object()

        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'error': 'Status é obrigatório.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar se o status é válido
        valid_statuses = [choice[0] for choice in Appointment.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Status inválido. Opções válidas: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = new_status
        appointment.save()

        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """
        Endpoint para atualizar apenas o status da consulta (padrão do checklist).
        Exemplo: PATCH /api/v1/appointments/{id}/status/
        Body: {"status": "confirmada"}
        """
        return self.update_status_action(request, pk)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_view(request):
    """
    View para visualização de calendário (compatibilidade com endpoints existentes).
    """
    nutritionist = request.user
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    appointments = Appointment.objects.filter(user=nutritionist)

    if start_date:
        appointments = appointments.filter(date__gte=start_date)
    if end_date:
        appointments = appointments.filter(date__lte=end_date)

    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)
