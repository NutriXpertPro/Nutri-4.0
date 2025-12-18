from .models import NotificationSettings


def should_send_notification(user, notification_type):
    """
    Verifica se uma notificação deve ser enviada com base nas preferências do usuário.
    
    Args:
        user: Usuário que receberá a notificação
        notification_type: Tipo de notificação (ex: 'appointment_reminder', 'diet_expiry', 'new_message')
    
    Returns:
        bool: True se a notificação deve ser enviada, False caso contrário
    """
    try:
        user_settings = NotificationSettings.objects.get(user=user)
        
        # Mapeamento do tipo de notificação para o campo de configuração correspondente
        type_mapping = {
            'appointment_reminder': user_settings.notify_appointment_reminder,
            'diet_expiry': user_settings.notify_diet_expiry,
            'new_message': user_settings.notify_new_message,
            'system': user_settings.notify_system,
            'payment': user_settings.notify_payment,
        }
        
        # Retorna o valor da preferência para o tipo específico de notificação
        return type_mapping.get(notification_type, True)  # Padrão é True se o tipo não for encontrado
        
    except NotificationSettings.DoesNotExist:
        # Se o usuário não tiver configurações, assumimos que deseja receber todas as notificações
        return True