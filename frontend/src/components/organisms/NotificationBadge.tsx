'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  conversationId: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ conversationId }) => {
  const [isVisible, setIsVisible] = useState(false);

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['unreadCount', conversationId],
    queryFn: async () => {
      // Aqui você faria a chamada real para obter o número de mensagens não lidas
      // Por enquanto, usando um valor mockado
      return 0;
    },
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  useEffect(() => {
    setIsVisible(unreadCount > 0);
  }, [unreadCount]);

  if (!isVisible || unreadCount === 0) {
    return null;
  }

  return (
    <div className="absolute -top-2 -right-2">
      <Badge className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
        {unreadCount > 9 ? '9+' : unreadCount}
      </Badge>
    </div>
  );
};

export default NotificationBadge;