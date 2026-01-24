'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notification-service';

interface NotificationBadgeProps {
  conversationId: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ conversationId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['unreadCount', conversationId],
    queryFn: async () => {
      // Usar o serviço real para buscar contagem
      try {
        const count = await notificationService.fetchUnreadCount();
        return count;
      } catch (error) {
        console.error("Failed to fetch unread count", error);
        return 0;
      }
    },
    refetchInterval: 3000, // Poll a cada 3 segundos (instantâneo)
    staleTime: 0,
  });

  useEffect(() => {
    // Tocar som se a contagem aumentou e não é a primeira carga (prev > 0 ou tratado diferentemente)
    // Mas para garantir que toca quando chega msg nova:
    if (unreadCount > prevCount && unreadCount > 0) {
      notificationService.playNotificationSound();
    }

    setPrevCount(unreadCount);
    setIsVisible(unreadCount > 0);
  }, [unreadCount]);

  if (!isVisible || unreadCount === 0) {
    return null;
  }

  return (
    <div className="absolute -top-2 -right-2 transform scale-100 animate-in fade-in zoom-in duration-300">
      <span className="relative flex h-5 w-5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <Badge className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white text-[10px] items-center justify-center p-0 border-2 border-white dark:border-zinc-900 shadow-sm">
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      </span>
    </div>
  );
};

export default NotificationBadge;