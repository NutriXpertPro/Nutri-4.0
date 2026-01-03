from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from .models import UserBranding
from .serializers import UserBrandingSerializer
from django.core.exceptions import ValidationError
from django.conf import settings
from django.core.files.base import ContentFile
import os
import io
import logging

logger = logging.getLogger(__name__)


def process_signature_image(image_file):
    """
    Remove o fundo da imagem de assinatura usando rembg.
    Retorna a imagem processada como ContentFile ou None se falhar.
    """
    try:
        from rembg import remove
        from PIL import Image
        
        # Ler a imagem original
        input_image = Image.open(image_file)
        
        # Converter para RGB se necessário (para evitar problemas com RGBA/P modes)
        if input_image.mode in ('RGBA', 'LA', 'P'):
            input_image = input_image.convert('RGBA')
        else:
            input_image = input_image.convert('RGB')
        
        # Remover o fundo
        output_image = remove(input_image)
        
        # Salvar em bytes como PNG (para manter transparência)
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format='PNG', optimize=True)
        output_buffer.seek(0)
        
        # Criar ContentFile com o nome original mas extensão .png
        original_name = os.path.splitext(image_file.name)[0]
        return ContentFile(output_buffer.getvalue(), name=f"{original_name}_transparent.png")
        
    except ImportError:
        logger.warning("rembg não está instalado. A assinatura será salva sem processamento.")
        return None
    except Exception as e:
        logger.error(f"Erro ao processar assinatura: {str(e)}")
        return None


class UserBrandingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar configurações de branding do usuário.
    """
    queryset = UserBranding.objects.all()
    serializer_class = UserBrandingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Apenas o branding do usuário autenticado
        return UserBranding.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Garantir que o usuário só pode criar branding para si mesmo
        serializer.save(user=self.request.user)

    def get_object(self):
        # Garantir que o usuário só acesse o próprio branding
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        Acessar ou atualizar as configurações de branding do usuário autenticado.
        """
        try:
            user_branding, created = UserBranding.objects.get_or_create(
                user=request.user,
                defaults={
                    'user': request.user,
                    'primary_color': '#22c55e',  # Verde padrão
                    'secondary_color': '#059669'  # Verde escuro padrão
                }
            )

            if request.method == 'GET':
                serializer = self.get_serializer(user_branding)
                return Response(serializer.data)

            elif request.method == 'PATCH':
                # Processar assinatura se enviada
                data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
                
                if 'signature_image' in request.FILES:
                    signature_file = request.FILES['signature_image']
                    try:
                        processed_signature = process_signature_image(signature_file)
                        if processed_signature:
                            data['signature_image'] = processed_signature
                    except Exception as sig_error:
                        logger.error(f"Erro crítico ao processar assinatura: {str(sig_error)}")
                        # Continuar sem a assinatura processada em caso de erro crítico
                
                serializer = self.get_serializer(
                    user_branding, 
                    data=data, 
                    partial=True,
                    context={'request': request}
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            logger.error(f"Erro crítico detectado em branding/me: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Erro interno do servidor.", "details": str(e), "path": request.path}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )