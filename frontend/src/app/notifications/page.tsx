'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
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
  type: 'message' | 'appointment' | 'diet' | 'evaluation' | 'lab_exam' | 'system' | 'payment';
  title: string;
  message: string;
  timestamp: string; // ISO string
  is_read: boolean;
  related_id?: string; // ID do objeto relacionado (mensagem, consulta, etc)
  patient_pid?: string; // ID do perfil do paciente relacionado
  user_name?: string; // Nome do usuário relacionado (paciente, remetente, etc)
  patient_avatar?: string; // Foto do paciente do backend
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  const router = useRouter();

  // Mapear tipos do backend para os tipos usados no frontend
  const mapNotificationType = (backendType: string) => {
    const normalizedType = (backendType || '').toLowerCase();

    switch (normalizedType) {
      case 'appointment_reminder':
      case 'appointment':
        return 'appointment';
      case 'diet_expiry':
      case 'diet':
        return 'diet';
      case 'new_message':
      case 'message':
        return 'message';
      case 'evaluation':
        return 'evaluation';
      case 'lab_exam':
        return 'lab_exam';
      case 'payment':
        return 'payment';
      case 'system':
      case 'app':
      default:
        return 'system';
    }
  };

  // Carregar notificações do backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.get('notifications/');

        // Ajustar os campos para corresponder à interface
        const formattedNotifications = response.data.map((item: any) => {
          let message = item.message || 'Nova notificação';
          let extracted_id = '';

          // Extrair ID no formato [ID:xxx]
          const idMatch = message.match(/\[ID:([^\]]+)\]/);
          if (idMatch) {
            extracted_id = idMatch[1];
            // Remover a tag de ID da mensagem exibida
            message = message.replace(/\[ID:[^\]]+\]/, '').trim();
          }

          // Extrair Patient ID no formato [PID:xxx]
          let extracted_pid = '';
          const pidMatch = message.match(/\[PID:([^\]]+)\]/);
          if (pidMatch) {
            extracted_pid = pidMatch[1];
            // Remover a tag de PID da mensagem exibida
            message = message.replace(/\[PID:[^\]]+\]/, '').trim();
          }

          // Extrair nome do usuário da mensagem, se possível
          let extracted_user_name = '';
          if (message && typeof message === 'string') {
            // Procurar por padrões de nome na mensagem de forma mais limpa
            // Regex melhorada para capturar nomes compostos e parar antes de vírgulas ou IDs
            // Regex melhorada para capturar nomes compostos e parar antes de vírgulas ou IDs
            // Tenta primeiro capturar o nome após os dois pontos
            const patientMatch = message.match(/Novo paciente cadastrado\s*:\s*([^,\[]+)/i);
            const messageMatch = message.match(/Nova mensagem de\s*:\s*([^,\[]+)/i);

            if (patientMatch) {
              extracted_user_name = patientMatch[1].trim();
            } else if (messageMatch) {
              extracted_user_name = messageMatch[1].trim();
            }
          }

          // Limpeza fina do nome (remover espaços duplos e caracteres residuais)
          if (extracted_user_name) {
            extracted_user_name = extracted_user_name.replace(/\s+/g, ' ').trim();
          }

          return {
            id: item.id.toString(),
            type: mapNotificationType(item.notification_type) || 'system',
            title: item.title || (message || '').replace(/Novo paciente cadastrado\s*:\s*/i, '').replace(/Nova mensagem de\s*:\s*/i, '') || item.notification_type || 'Notificação',
            message: message,
            timestamp: item.sent_at || item.created_at,
            is_read: item.is_read || false,
            user_name: extracted_user_name || item.patient_name || undefined,
            related_id: extracted_id || undefined,
            patient_pid: extracted_pid || item.patient_id?.toString() || undefined,
            patient_avatar: item.patient_avatar || undefined
          };
        });

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
      // Primeiro tenta o endpoint específico
      await api.patch(`notifications/${id}/mark_as_read/`);
      setNotifications(prev =>
        prev.filter(notif => notif.id !== id)
      );
    } catch (firstError) {
      console.error('Primeira tentativa falhou:', firstError);
      try {
        // Se o endpoint específico falhar, tenta atualizar diretamente
        await api.patch(`notifications/${id}/`, { is_read: true });
        setNotifications(prev =>
          prev.filter(notif => notif.id !== id)
        );
      } catch (secondError) {
        console.error('Segunda tentativa falhou:', secondError);
        // Se ambas as tentativas falharem, atualiza apenas localmente
        setNotifications(prev =>
          prev.filter(notif => notif.id !== id)
        );
      }
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      await api.patch('notifications/mark_all_as_read/');
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      // Atualiza apenas localmente se a API falhar
      setNotifications([]);
    }
  };

  // Filtrar notificações com base no estado ativo
  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => !n.is_read);

  // Obter tipo real detectado (para sistema)
  const getDetectedType = (notification: Notification): Notification['type'] => {
    if (notification.type !== 'system') return notification.type;

    const content = `${notification.title} ${notification.message}`.toLowerCase();

    // Prioridades: 
    // 1. Mensagens/Conversas
    if (content.includes('mensagem') || content.includes('conversa')) return 'message';
    // 2. Consultas/Agendamentos (prioridade sobre 'paciente' para evitar falsos positivos)
    if (content.includes('consulta') || content.includes('agendamento') || content.includes('horário')) return 'appointment';
    // 3. Dietas
    if (content.includes('dieta') || content.includes('plano alimentar')) return 'diet';
    // 4. Avaliações
    if (content.includes('avaliação') || content.includes('antropometria')) return 'evaluation';
    // 5. Exames
    if (content.includes('exame') || content.includes('bioquímica') || content.includes('upload')) return 'lab_exam';
    // 6. Pagamentos
    if (content.includes('pagamento') || content.includes('assinatura') || content.includes('fatura')) return 'payment';
    // 7. Pacientes (Cadastro de novo paciente)
    if (content.includes('paciente')) return 'system'; // Mapeado para sistema que redireciona para patients

    return 'system';
  };

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
  const getTypeBadge = (notification: Notification) => {
    const type = getDetectedType(notification);
    switch (type) {
      case 'message':
        return <Badge variant="secondary">Mensagem</Badge>;
      case 'appointment':
        return <Badge variant="outline">Consulta</Badge>;
      case 'diet':
        return <Badge variant="default">Dieta</Badge>;
      case 'evaluation':
        return <Badge variant="outline">Avaliação</Badge>;
      case 'lab_exam':
        return <Badge variant="outline">Exame</Badge>;
      case 'payment':
        return <Badge variant="outline">Pagamento</Badge>;
      default:
        return <Badge variant="outline">Sistema</Badge>;
    }
  };

  // Obter texto para o botão de ação com base no tipo de notificação
  const getActionText = (notification: Notification) => {
    const type = getDetectedType(notification);
    switch (type) {
      case 'message':
        return 'Ver Mensagem';
      case 'appointment':
        return 'Ver Consulta';
      case 'diet':
        return 'Ver Dieta';
      case 'evaluation':
        return 'Ver Avaliação';
      case 'lab_exam':
        return 'Ver Exame';
      case 'payment':
        return 'Ver Pagamento';
      default:
        return 'Ver Detalhes';
    }
  };

  // Navegar para a página apropriada com base no tipo de notificação
  const handleNotificationClick = async (notification: Notification) => {
    console.log('Notification click started:', notification);

    const targetUrl = await (async (): Promise<string> => {
      const type = getDetectedType(notification);
      const id = notification.related_id;
      let pid = notification.patient_pid;
      const content = `${notification.title} ${notification.message}`.toLowerCase();

      // Fallback: Se não temos PID mas temos user_name, tenta buscar o ID do paciente pelo nome
      if (!pid && notification.user_name) {
        try {
          console.log(`Fallback: Searching for patient ID for "${notification.user_name}"`);
          const response = await api.get(`patients/search/?q=${encodeURIComponent(notification.user_name)}`);
          if (response.data && response.data.length > 0) {
            // Se encontrar exatamente um ou o primeiro, assume que é esse
            pid = response.data[0].id.toString();
            console.log(`Fallback: Found patient ID: ${pid}`);
          }
        } catch (error) {
          console.error('Fallback search failed:', error);
        }
      }

      switch (type) {
        case 'message':
          if (pid) return `/patients/${pid}?tab=context`;
          return id ? `/messages?conversation=${id}` : '/messages';
        case 'appointment':
          if (pid) return `/patients/${pid}?tab=timeline`;
          return id ? `/calendar?appointment=${id}` : '/calendar';
        case 'diet':
          if (pid) return `/patients/${pid}?tab=diet`;
          return id ? `/diets?id=${id}` : '/diets';
        case 'evaluation':
          if (pid) return `/patients/${pid}?tab=analysis`;
          return id ? `/evaluations?id=${id}` : '/evaluations';
        case 'lab_exam':
          if (pid) return `/patients/${pid}?tab=analysis`;
          return id ? `/lab-exams?id=${id}` : '/lab-exams';
        case 'payment':
          return id ? `/payments?id=${id}` : '/payments';
        case 'system':
          // Se tiver um ID relacionado e for sobre paciente, vai pro perfil
          if (content.includes('paciente')) {
            const patientId = pid || id;
            return patientId ? `/patients/${patientId}` : '/patients';
          }
          return '/dashboard';
        default: return '/dashboard';
      }
    })();

    console.log('Target URL defined:', targetUrl);
    toast.info(`Redirecionando para: ${targetUrl}`);

    // Marcar como lida em background (sem await para não bloquear a navegação)
    if (!notification.is_read) {
      markAsRead(notification.id).catch(err => console.error('Background markAsRead failed:', err));
    }

    // Tentar navegar usando o router do Next.js
    try {
      console.log('Attempting router.push to:', targetUrl);
      router.push(targetUrl);

      // Fallback de segurança: se após 1s ainda estivermos na mesma página, tenta window.location
      setTimeout(() => {
        if (window.location.pathname === '/notifications' && (targetUrl as string) !== '/notifications') {
          console.warn('router.push seems stuck, using window.location.href as fallback');
          window.location.href = targetUrl;
        }
      }, 1000);
    } catch (error) {
      console.error('router.push failed:', error);
      window.location.href = targetUrl;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
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
                <h3 className="text-lg font-normal text-foreground mb-1">Nenhuma notificação</h3>
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
                  "group relative overflow-hidden transition-all duration-500 cursor-pointer",
                  "hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2",
                  "bg-background/40 border border-border shadow-xl",
                  !notification.is_read ? 'border-l-4 border-l-primary' : ''
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  {/* Header: Avatar + Title + Actions */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                        <AvatarImage src={notification.patient_avatar} alt={notification.user_name} />
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
                        <h3 className={cn(
                          "text-lg tracking-tight truncate group-hover:text-primary transition-colors font-normal",
                          !notification.is_read ? "font-normal" : ""
                        )}>
                          {notification.user_name || notification.title}
                        </h3>
                        {!notification.is_read && (
                          <Badge variant="default" className="text-[10px] h-4 px-1.5 uppercase tracking-wider">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getTypeBadge(notification)}
                        {notification.user_name && (
                          <span className="text-xs text-muted-foreground">
                            {notification.title}
                          </span>
                        )}
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


                  {/* Footer: Date + Action */}
                  <div className="flex items-center justify-between pt-5 border-t border-border/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest mb-1">Enviado em</span>
                      <span className="text-xs font-normal text-foreground">
                        {new Date(notification.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-9 px-4 rounded-xl border-border/20 text-[10px] uppercase tracking-widest transition-all shadow-sm",
                          !notification.is_read
                            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                            : "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        )}
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que o clique no botão dispare o clique no card
                          markAsRead(notification.id);
                        }}
                      >
                        {!notification.is_read ? 'Marcar como Lida' : 'Lida'}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-9 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que o clique no botão dispare o clique no card
                          handleNotificationClick(notification);
                        }}
                      >
                        {getActionText(notification)}
                      </Button>
                    </div>
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