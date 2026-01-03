// Serviço de notificação para mensagens
import api from '@/services/api';

export const notificationService = {
  // Solicitar permissão para notificações do navegador
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações de desktop');
      return 'denied';
    }

    return await Notification.requestPermission();
  },

  // Mostrar notificação de nova mensagem
  showNotification(title: string, options: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  },

  // Verificar se notificações estão habilitadas
  isNotificationEnabled(): boolean {
    return Notification.permission === 'granted';
  },

  // Enviar notificação de nova mensagem
  notifyNewMessage(senderName: string, messageContent: string): void {
    if (this.isNotificationEnabled()) {
      this.showNotification(`Nova mensagem de ${senderName}`, {
        body: messageContent,
        icon: '/favicon.ico',
        tag: 'new-message'
      });
    }
  },

  // Atualizar badge de notificação no header
  updateNotificationBadge(count: number): void {
    // Atualizar contador no ícone da aplicação ou no header
    if (typeof window !== 'undefined') {
      // Atualiza o contador no elemento do header
      const notificationBadge = document.querySelector('#notification-badge') ||
        document.querySelector('button[aria-label="Notifications"] .absolute');
      if (notificationBadge) {
        // Se o elemento for um span/badge com texto
        if (notificationBadge instanceof HTMLElement) {
          notificationBadge.textContent = count > 0 ? count.toString() : '';
        }

        // Se quiser buscar o pai botão
        const parentButton = notificationBadge.closest('button');
        if (parentButton) {
          const existingBadge = parentButton.querySelector('.animate-pulse');
          if (existingBadge) {
            existingBadge.textContent = count > 0 ? count.toString() : '';
            if (count === 0) {
              existingBadge.classList.add('hidden');
            } else {
              existingBadge.classList.remove('hidden');
            }
          }
        }
      }
    }
  },

  // Carregar contagem de notificações não lidas do backend
  async fetchUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/');
      const unreadNotifications = response.data.filter((notif: any) => !notif.is_read);
      return unreadNotifications.length;
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações não lidas:', error);
      return 0;
    }
  },

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/mark_as_read/`);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  // Marcar todas as notificações como lidas
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/mark_all_as_read/');
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }
};

// Função para inicializar o serviço de notificação
export const initializeNotificationService = () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    notificationService.requestPermission();
  }
};