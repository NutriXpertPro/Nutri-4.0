from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import PatientDiaryEntry, SocialLike, SocialComment
from .serializers_diary import PatientDiaryEntrySerializer, SocialLikeSerializer, SocialCommentSerializer


class PatientDiaryEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar entradas no diário do paciente
    """
    serializer_class = PatientDiaryEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Apenas entradas do paciente autenticado
        if hasattr(self.request.user, 'patient_profile'):
            return PatientDiaryEntry.objects.filter(patient=self.request.user.patient_profile)
        return PatientDiaryEntry.objects.none()

    def perform_create(self, serializer):
        # Associar a entrada ao paciente autenticado
        if hasattr(self.request.user, 'patient_profile'):
            serializer.save(patient=self.request.user.patient_profile)
        else:
            raise serializers.ValidationError("Usuário não é um paciente registrado")

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """
        Curtir uma entrada específica
        """
        diary_entry = self.get_object()
        like, created = SocialLike.objects.get_or_create(
            user=request.user,
            diary_entry=diary_entry
        )
        
        if created:
            return Response({'status': 'liked', 'like_id': like.id}, status=status.HTTP_201_CREATED)
        else:
            like.delete()
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def likes(self, request, pk=None):
        """
        Obter todas as curtidas de uma entrada específica
        """
        diary_entry = self.get_object()
        likes = diary_entry.likes.all()
        serializer = SocialLikeSerializer(likes, many=True)
        return Response(serializer.data)


class SocialCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar comentários
    """
    serializer_class = SocialCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Obter comentários associados às entradas do diário do paciente
        user = self.request.user
        if hasattr(user, 'patient_profile'):
            # Comentários nas entradas do paciente ou comentários do paciente em outras entradas
            patient_diary_entries = PatientDiaryEntry.objects.filter(patient=user.patient_profile)
            return SocialComment.objects.filter(
                diary_entry__in=patient_diary_entries
            ).select_related('user', 'diary_entry')
        return SocialComment.objects.none()

    def perform_create(self, serializer):
        # Associar o comentário ao usuário autenticado
        serializer.save(user=self.request.user)


class CommunityFeedViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para o feed da comunidade
    """
    serializer_class = PatientDiaryEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Obter entradas de todos os pacientes com permissão de comunidade
        # (Implementação simplificada - em um sistema real, considerar permissões e configurações de privacidade)
        return PatientDiaryEntry.objects.filter(
            # Por exemplo, apenas entradas de pacientes que optaram por participar da comunidade
            # Neste exemplo, vamos considerar todas as entradas públicas
        ).select_related('patient__user').order_by('-timestamp')[:50]  # Limitar a 50 últimas entradas

    @action(detail=False, methods=['get'])
    def my_network(self, request):
        """
        Obter entradas dos pacientes que fazem parte da rede do nutricionista
        """
        if hasattr(request.user, 'managed_patients'):
            # Obter entradas dos pacientes gerenciados pelo nutricionista autenticado
            patient_ids = request.user.managed_patients.values_list('id', flat=True)
            diary_entries = PatientDiaryEntry.objects.filter(
                patient_id__in=patient_ids
            ).select_related('patient__user').order_by('-timestamp')
            
            serializer = self.get_serializer(diary_entries, many=True)
            return Response(serializer.data)
        
        return Response([], status=status.HTTP_200_OK)