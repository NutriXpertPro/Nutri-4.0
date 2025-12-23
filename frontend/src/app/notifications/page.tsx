'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  MessageSquare,
  Calendar,
  UtensilsCrossed,
  Mail,
  Check,
  CheckCheck,
  User
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
          title: (item.message || '').replace(/Novo paciente cadastrado\s*:\s*/i, '').replace(/Nova mensagem de\s*:\s*/i, '') || item.type || 'Notificação',
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
        return <User className="h-5 w-5 text-primary" />;
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
            <h1 className="text-2xl font-normal text-foreground">Notificações</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-yellow-700" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                variant="glass"
                className={cn(
                  "group relative overflow-hidden transition-all duration-500",
                  "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2",
                  "bg-background/40 border border-border shadow-xl",
                  !notification.is_read ? 'border-l-4 border-l-primary' : ''
                )}
              >
                <CardContent className="p-6">
                  {/* Header: Avatar + Title + Actions */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                          {notification.type === 'message' ? <MessageSquare className="h-6 w-6" /> :
                            notification.type === 'appointment' ? <Calendar className="h-6 w-6" /> :
                              notification.type === 'diet' ? <UtensilsCrossed className="h-6 w-6" /> :
                                <User className="h-6 w-6" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-background shadow-sm",
                        !notification.is_read ? "bg-primary animate-pulse" : "bg-slate-300"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <h3 className={cn(
                          "text-lg tracking-tight truncate group-hover:text-primary transition-colors font-normal",
                          !notification.is_read ? "font-semibold" : ""
                        )}>
                          {notification.title.replace(/Novo paciente cadastrado\s*:\s*/i, '').replace(/Nova mensagem de\s*:\s*/i, '')}
                        </h3>
                        {!notification.is_read && (
                          <Badge variant="primary" className="text-[10px] h-4 px-1.5 uppercase tracking-wider">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTypeBadge(notification.type)}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 w-8 rounded-xl bg-muted/20 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                    >
                      {notification.is_read ? (
                        <CheckCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Info Grid (Simulando o estilo de info do PatientCard) */}
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-muted/20 border border-border/5 group/info hover:bg-muted/40 transition-colors">
                      <div className="p-2 rounded-xl bg-background shadow-sm text-primary group-hover/info:scale-110 transition-transform">
                        {getIcon(notification.type)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message.replace(/Novo paciente cadastrado\s*:\s*/i, '').replace(/Nova mensagem de\s*:\s*/i, '')}
                      </p>
                    </div>
                  </div>

                  {/* Footer: Date + Action */}
                  <div className="flex items-center justify-between pt-5 border-t border-border/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Enviado em</span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {new Date(notification.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-9 px-4 rounded-xl border-border/20 text-[10px] uppercase tracking-widest transition-all shadow-sm",
                        !notification.is_read
                          ? "bg-primary text-white border-primary hover:bg-primary/90"
                          : "hover:bg-primary hover:text-white hover:border-primary"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {!notification.is_read ? 'Marcar como Lida' : 'Lida'}
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