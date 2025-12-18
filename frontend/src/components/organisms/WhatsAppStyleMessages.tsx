'use client';

import React, { useState, useEffect } from 'react';
import { Message, Conversation, UserType } from '@/types/chat';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, User, Phone, Video, MoreVertical, Check, CheckCheck, Paperclip, Smile, Mic, Send, Bell, BellOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import axios from 'axios';
import { notificationService } from '@/services/notification-service';

interface WhatsAppConversationsListProps {
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
}

// Componente apenas para a lista de conversas
const WhatsAppConversationsList: React.FC<WhatsAppConversationsListProps> = ({
  selectedConversationId,
  onConversationSelect
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Carregar conversas do backend
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/messages/inbox/');

        // Verificar se há novas conversas ou mensagens não vistas
        const previousConversations = conversations;
        setConversations(response.data);

        // Identificar novas mensagens para notificação
        response.data.forEach((newConv: Conversation) => {
          const oldConv = previousConversations.find((c: Conversation) => c.id === newConv.id);

          // Se houver nova mensagem e ela não foi lida pelo usuário atual
          if (oldConv && newConv.last_message !== oldConv.last_message && newConv.unread_count > 0) {
            // Tentar mostrar notificação
            const participant = newConv.participants.find(p => p.id !== currentUserId);
            if (participant) {
              notificationService.notifyNewMessage(
                participant.name,
                newConv.last_message || 'Nova mensagem'
              );
            }
          }
        });

        // Atualizar badge de notificações
        const totalUnread = response.data.reduce((sum: number, conv: Conversation) => sum + conv.unread_count, 0);
        // Usar o serviço para atualizar a badge com base nas notificações do backend
        notificationService.fetchUnreadCount().then(count => {
          notificationService.updateNotificationBadge(count);
        }).catch(() => {
          // Fallback para o cálculo local se a API falhar
          notificationService.updateNotificationBadge(totalUnread);
        });

        // Obter ID do usuário atual (isso pode vir do contexto de autenticação)
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUserId(user.id?.toString() || null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar conversas:', error);
        // Em caso de erro 404, tentar endpoint alternativo
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          try {
            // Tentar endpoint alternativo para listagem de conversas
            const response = await api.get('/messages/conversations/');
            const conversationsData = response.data.map((conv: any) => ({
              ...conv,
              last_message: conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].content : '',
              last_message_time: conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].timestamp : null,
              unread_count: 0 // Para simplificar, inicializar como 0
            }));
            setConversations(conversationsData);
          } catch (fallbackError) {
            console.error('Erro ao carregar conversas com endpoint alternativo:', fallbackError);
          }
        } else {
          // Para outros tipos de erro, tentar novamente com fallback
          try {
            const response = await api.get('/messages/conversations/');
            const conversationsData = response.data.map((conv: any) => ({
              ...conv,
              last_message: conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].content : '',
              last_message_time: conv.messages?.length > 0 ? conv.messages[conv.messages.length - 1].timestamp : null,
              unread_count: 0
            }));
            setConversations(conversationsData);
          } catch (fallbackError) {
            console.error('Erro ao carregar conversas com endpoint alternativo:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Configurar polling para atualizações (a cada 5 segundos)
    const interval = setInterval(fetchConversations, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {conversations.map((conversation) => {
          const participant = conversation.participants.find(
            p => p.id !== currentUserId
          );

          return (
            <Card
              key={conversation.id}
              className={cn(
                'border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                selectedConversationId === conversation.id && 'bg-green-50 dark:bg-green-900/30'
              )}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <CardContent className="p-3 flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300">
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {participant?.name || 'Paciente'}
                    </h3>
                    {conversation.last_message_time && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversation.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    {conversation.last_message ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.last_message}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        Nenhuma mensagem ainda
                      </p>
                    )}
                    {conversation.unread_count > 0 && (
                      <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

interface WhatsAppChatAreaProps {
  conversationId: string;
  currentUserId: string;
}

// Componente apenas para a área de chat
const WhatsAppChatArea: React.FC<WhatsAppChatAreaProps> = ({ conversationId, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Carregar mensagens da conversa específica
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Buscar detalhes da conversa
        const conversationResponse = await api.get(`/conversations/${conversationId}/`);
        setConversation(conversationResponse.data);

        // Buscar mensagens da conversa
        const response = await api.get(`/messages/?conversation=${conversationId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        // Em caso de erro, tentar endpoints alternativos
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          try {
            // Tentar endpoint alternativo
            const conversationResponse = await api.get(`/conversations/${conversationId}/`);
            setConversation(conversationResponse.data);

            // Para mensagens, usar dados do objeto de conversa se disponíveis
            const messagesResponse = await api.get(`/conversations/${conversationId}/messages/`);
            setMessages(messagesResponse.data);
          } catch (fallbackError) {
            console.error('Erro ao carregar mensagens com endpoint alternativo:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Configurar polling para atualizações (a cada 5 segundos)
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Auto-scroll para o final quando novas mensagens são adicionadas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll para o final quando mensagens mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      // Enviar mensagem através da API
      const response = await api.post(`/messages/`, {
        content: message,
        conversation: conversationId
      });

      // Adicionar nova mensagem à lista
      setMessages(prev => [...prev, response.data]);
      setMessage('');

      // Atualizar a lista de conversas para refletir a nova mensagem
      // (Isso pode ser feito via atualização imediata ou via polling)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Tratar erro de envio
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ overflow: 'hidden', maxHeight: '100%' }}>
      {/* Chat Header - only shows when conversation is selected */}
      <div className="bg-background text-foreground p-4 flex items-center justify-between border-b flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-border"></div>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {conversation?.participants.find(p => p.id !== currentUserId)?.name || 'Paciente'}
            </h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" className="text-foreground hover:bg-accent">
            <Phone className="w-5 h-5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-foreground hover:bg-accent">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-foreground hover:bg-accent">
            {notificationService.isNotificationEnabled() ?
              <Bell className="w-5 h-5" /> :
              <BellOff className="w-5 h-5" />
            }
          </Button>
          <Button size="sm" variant="ghost" className="text-foreground hover:bg-accent">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 min-h-0 p-4 space-y-3 bg-muted"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.sender.id === currentUserId ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 shadow-sm',
                msg.sender.id === currentUserId
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-background text-foreground rounded-tl-none border'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div
                className={cn(
                  'text-xs mt-1 flex items-center justify-end',
                  msg.sender.id === currentUserId
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender.id === currentUserId && (
                  <span className="ml-1">
                    {msg.is_read ? <CheckCheck className="w-3 h-3 text-primary-foreground/80" /> : <Check className="w-3 h-3" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} id="messages-end" />
      </div>

      {/* Message Input Area */}
      <div className="bg-muted p-3 flex items-center space-x-2 flex-shrink-0">
        <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-accent">
          <Smile className="w-5 h-5" />
        </Button>
        <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-accent">
          <Paperclip className="w-5 h-5" />
        </Button>
        <div className="flex-1 bg-background rounded-lg px-3 py-2 border">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="border-0 focus:ring-0 focus:outline-none bg-transparent"
          />
        </div>
        {message.trim() === '' ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:bg-accent"
          >
            <Mic className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Atualizar o componente principal para exportar o ChatArea como sub-componente
const WhatsAppStyleMessages = Object.assign(WhatsAppConversationsList, {
  ChatArea: WhatsAppChatArea
});

export default WhatsAppStyleMessages;