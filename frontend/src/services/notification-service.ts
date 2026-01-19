import api from './api';

console.log('Notification Service Module Loading...');

// Standalone functions to avoid object property issues with some bundlers
export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  const setting = localStorage.getItem('notificationSoundEnabled');
  return setting === null ? true : setting === 'true';
};

export const toggleSound = () => {
  if (typeof window === 'undefined') return;
  const current = isSoundEnabled();
  const newState = !current;
  localStorage.setItem('notificationSoundEnabled', String(newState));
  return newState;
};

export const isNotificationEnabled = () => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && Notification.permission === 'granted';
};

export const playNotificationSound = () => {
  if (!isSoundEnabled()) return;

  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Auto-play prevented:", error);
      });
    }
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(200);
    }
  } catch (e) {
    console.error("Error playing notification sound:", e);
  }
};

export const updateNotificationBadge = (count: number) => {
  if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
    // @ts-ignore
    navigator.setAppBadge(count).catch((e) => console.error(e));
  }
};

export const fetchUnreadCount = async (): Promise<number> => {
  console.log('fetchUnreadCount called');
  try {
    const response = await api.get('/notifications/');
    if (Array.isArray(response.data)) {
      const count = response.data.filter((n: any) => !n.is_read).length;
      console.log('fetchUnreadCount result:', count);
      return count;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

export const notifyNewMessage = (sender: string, message: string) => {
  if (typeof window === 'undefined') return;
  
  if (isNotificationEnabled()) {
    try {
      new Notification(`Nova mensagem de ${sender}`, {
        body: message,
        icon: '/logo.png' 
      });
    } catch (e) {
      console.error("Error showing notification:", e);
    }
  }
};

export const markAsRead = async (id: number) => {
  try {
    await api.patch(`/notifications/${id}/`, { is_read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const initializeNotificationService = async () => {
  if (typeof window === 'undefined') return;
  
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.error("Error requesting notification permission:", e);
    }
  }
  
  console.log("Notification service initialized");
};

// Export the object for backward compatibility
const service = {
  isSoundEnabled,
  toggleSound,
  isNotificationEnabled,
  playNotificationSound,
  updateNotificationBadge,
  fetchUnreadCount,
  notifyNewMessage,
  markAsRead,
  initializeNotificationService
};

export const notificationService = service;

// Default export if anyone uses it
export default service;