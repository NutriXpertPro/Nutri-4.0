from rest_framework import serializers
from .models import UserBranding


class UserBrandingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBranding
        fields = [
            'id', 'logo', 'primary_color', 'secondary_color',
            'business_name', 'crn_number', 'professional_license',
            'email_signature', 'phone', 'address',
            'document_header', 'document_footer', 'signature_image',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        # Ajustar a URL do logo para ser absoluta, se existir
        if instance.logo and request:
            representation['logo'] = request.build_absolute_uri(instance.logo.url)
        # Ajustar a URL da assinatura para ser absoluta, se existir
        if instance.signature_image and request:
            representation['signature_image'] = request.build_absolute_uri(instance.signature_image.url)
        return representation