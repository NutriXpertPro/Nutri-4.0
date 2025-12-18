'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  UtensilsCrossed, 
  Mail, 
  Check,
  CheckCheck
} from 'lucide-react';
import api from '@/services/api';

interface Notification {
  id: string;
  type: 'message' | 'appointment' | 'diet' | 'evaluation' | 'lab_exam' | 'system';
  title: string;
  message: string;
  timestamp: string; // ISO string
  is_read: boolean;
  related_id?: string; // ID do objeto relacionado (mensagem, consulta, etc)
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();

  // Carregar notificações do backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('/notifications');

        // Ajustar os campos para corresponder à interface
        const formattedNotifications = response.data.map((item: any) => ({
          id: item.id.toString(),
          type: item.type?.toLowerCase() || 'system',
          title: item.type || 'Notificação',
          message: item.message || 'Nova notificação',
          timestamp: item.sent_at || item.created_at,
          is_read: item.is_read || false,
        }));

        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Configurar polling para atualizações (a cada 30 segundos)
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/mark-read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Filtrar notificações com base no estado ativo
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  // Obter ícone com base no tipo de notificação
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'diet':
        return <UtensilsCrossed className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Obter badge com base no tipo de notificação
  const getTypeBadge = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <Badge variant="secondary">Mensagem</Badge>;
      case 'appointment':
        return <Badge variant="outline">Consulta</Badge>;
      case 'diet':
        return <Badge variant="default">Dieta</Badge>;
      default:
        return <Badge variant="outline">Sistema</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
            <p className="text-muted-foreground">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notificação' : 'notificações'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1 bg-muted p-1 rounded-md">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={activeFilter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter('unread')}
              >
                Não lidas
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={notifications.filter(n => !n.is_read).length === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma notificação</h3>
                <p className="text-muted-foreground">
                  {activeFilter === 'unread' 
                    ? 'Você leu todas as notificações.' 
                    : 'Você não tem notificações no momento.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`${!notification.is_read ? 'bg-accent/30 border-l-4 border-l-blue-500' : ''}`}
              >
                <CardContent className="p-4 flex items-start space-x-4">
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(notification.type)}
                      {!notification.is_read && (
                        <Badge variant="destructive" className="text-xs">
                          NOVA
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className={`font-medium mt-2 ${!notification.is_read ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      disabled={notification.is_read}
                    >
                      {notification.is_read ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground">
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;