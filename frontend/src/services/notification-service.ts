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

  // Tocar som de notificação
  playNotificationSound(): void {
    console.log('Tentando tocar som: /sounds/notification.mp3');
    try {
      const audio = new Audio('/sounds/notification.mp3');
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Som tocado com sucesso!');
          })
          .catch(error => {
            // Silencioso se for bloqueio de autoplay (comum em navegadores modernos)
            if (error.name !== 'NotAllowedError') {
              console.error('Falha ao tocar som:', error);
            }
          });
      }
    } catch (e) {
      console.error('Erro ao inicializar áudio:', e);
    }
  },

  // Enviar notificação de nova mensagem
  notifyNewMessage(senderName: string, messageContent: string): void {
    // Tocar som sempre que houver tentativa de notificar, independente da permissão visual
    this.playNotificationSound();

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

      // Atualizar o ícone de notificação para piscar em vermelho quando houver notificações não lidas
      const notificationButton = document.querySelector('button[aria-label="Notifications"]') ||
        document.querySelector('button svg.lucide-bell')?.closest('button');

      if (notificationButton) {
        if (count > 0) {
          // Adiciona classes para efeito de piscar em vermelho
          notificationButton.classList.add('animate-pulse', 'text-red-500');
          // Garante que o botão tenha a classe de animação pulsante
          notificationButton.classList.add('animate-pulse');
        } else {
          // Remove classes de efeito quando não há notificações
          notificationButton.classList.remove('animate-pulse', 'text-red-500');
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
    } catch (error: any) {
      // Falha silenciosa para erros de rede para não poluir o console do usuário
      if (error?.message === 'Network Error') {
        // Apenas aviso em dev, silencioso em prod se preferir
        console.warn('Backend indisponível para notificações (Network Error). Tentando novamente em breve...');
      } else {
        console.warn('Aviso ao buscar notificações:', error?.message || error);
      }
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
  },

  // Inicializar o serviço de notificação
  initializeNotificationService(): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.requestPermission();
    }
  }
};

export const initializeNotificationService = notificationService.initializeNotificationService;