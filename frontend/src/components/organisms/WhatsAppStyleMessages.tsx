'use client';

import React, { useState, useEffect } from 'react';
import { Message, Conversation, UserType } from '@/types/chat';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, Phone, Video, MoreVertical, Check, CheckCheck, Paperclip, Smile, Mic, Send, Bell, BellOff, Image as ImageIcon, FileText, Calendar, Utensils, Activity, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import axios from 'axios';
import { notificationService } from '@/services/notification-service';
import { useAuth } from '@/contexts/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Trash2, Eraser } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';

// Helper function to get initials from a name
const getInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Função para acionar efeito visual de notificação
const triggerNotificationVisualEffect = () => {
  // Toca o som de notificação
  notificationService.playNotificationSound();

  // Adiciona classe de animação ao ícone de notificação no header
  const notificationIcon = document.querySelector('button[aria-label="Notifications"]') ||
                           document.querySelector('button svg.lucide-bell').closest('button');

  if (notificationIcon) {
    // Adiciona classes para efeito de piscar em vermelho
    notificationIcon.classList.add('animate-pulse');

    // Remove a classe após 3 segundos para parar o efeito
    setTimeout(() => {
      notificationIcon.classList.remove('animate-pulse');
    }, 3000);
  }

  // Atualiza o badge de notificações
  notificationService.fetchUnreadCount().then(count => {
    notificationService.updateNotificationBadge(count);
  });
};

interface WhatsAppConversationsListProps {
  selectedConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  currentUserId?: string | null;
}

// Componente apenas para a lista de conversas
const WhatsAppConversationsList: React.FC<WhatsAppConversationsListProps> = ({
  selectedConversationId,
  onConversationSelect,
  currentUserId: propCurrentUserId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  // Usar useAuth diretamente para obter o currentUserId
  const { user: authUser, isLoading: authLoading } = useAuth();
  // Priorizar prop, depois auth context
  const currentUserId = propCurrentUserId ?? authUser?.id?.toString() ?? null;
  const [filter, setFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');

  // Search effect
  useEffect(() => {
    const searchPatients = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/patients/?search=${searchQuery}`);
        setSearchResults(response.data.results || response.data);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchPatients, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectPatient = async (patient: any) => {
    // Check if conversation already exists
    // O patient.id aqui é o PatientProfile ID, mas na conversa os participants são Users
    // O PatientProfileSerializer retorna o user_id real do usuário
    const targetUserId = String(patient.user_id || patient.id);

    const existingConversation = conversations.find(c =>
      c.participants.some(p => String(p.id) === targetUserId)
    );

    if (existingConversation) {
      onConversationSelect(existingConversation.id);
      setSearchQuery('');
    } else {
      // Create new conversation using the correct endpoint
      try {
        const response = await api.post('/messages/conversations/find-or-create-by-patient/', {
          patient_id: patient.id
        });

        const newConv = response.data;

        // Garantir que os dados do paciente estejam completos na nova conversa
        if (newConv.participants) {
          newConv.participants = newConv.participants.map((p: any) => {
            if (String(p.id) === targetUserId) {
              return {
                ...p,
                name: p.name || patient.name,
                avatar: p.avatar || patient.avatar || patient.photo
              };
            }
            return p;
          });
        }

        // Evitar duplicatas se o polling já tiver pegado
        setConversations(prev => {
          const exists = prev.some(c => c.id === newConv.id);
          if (exists) return prev;
          return [newConv, ...prev];
        });

        onConversationSelect(newConv.id);
        setSearchQuery('');
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    }
  };

  const handleClearMessages = async (convId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Tem certeza que deseja limpar todo o histórico desta conversa?')) return;

    try {
      await api.post(`/messages/conversations/${convId}/clear-messages/`);
      // Se a conversa limpa for a selecionada, poderíamos recarregar as mensagens
      // Mas o polling ou a ação do usuário no ChatArea deve cuidar disso
      alert('Histórico limpo com sucesso!');
      window.location.reload(); // Forma simples de atualizar tudo
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Erro ao limpar histórico.');
    }
  };

  const handleDeleteConversation = async (convId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir esta conversa? Todas as mensagens serão perdidas.')) return;

    try {
      await api.delete(`/messages/conversations/${convId}/`);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConversationId === convId) {
        // Notificar o pai que nada está selecionado
        onConversationSelect('');
      }
      alert('Conversa excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Erro ao excluir conversa.');
    }
  };

  // Carregar conversas do backend
  useEffect(() => {
    const fetchConversations = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
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

              // Adiciona efeito visual de piscar no ícone de notificação
              triggerNotificationVisualEffect();
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
      } catch (error) {
        if (!silent) console.error('Erro ao carregar conversas:', error);
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
            if (!silent) console.error('Erro ao carregar conversas com endpoint alternativo:', fallbackError);
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
            if (!silent) console.error('Erro ao carregar conversas com endpoint alternativo:', fallbackError);
          }
        }
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchConversations();

    // Configurar polling para atualizações (a cada 5 segundos)
    const interval = setInterval(() => fetchConversations(true), 5000);

    return () => clearInterval(interval);
  }, []);


  // Mostrar loading enquanto auth ou conversas estão carregando
  if ((loading && !conversations.length) || authLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  // Filtrar conversas com base no filtro selecionado
  const filteredConversations = conversations.filter(conversation => {
    switch (filter) {
      case 'unread':
        return conversation.unread_count > 0;
      case 'favorites':
        // Para implementação futura - por enquanto, retornamos todas as conversas
        return true;
      case 'groups':
        // Para implementação futura - por enquanto, retornamos todas as conversas
        return true;
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="px-3 pt-3 pb-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros - Only show if not searching */}
      {!searchQuery && (
        <div className="flex gap-2 p-3">
          {(['all', 'unread', 'favorites', 'groups'] as const).map((f) => (
            <button
              key={f}
              className={`px-4 py-2 text-sm capitalize rounded-full transition-colors ${filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Tudo' :
                f === 'unread' ? 'Não lidas' :
                  f === 'favorites' ? 'Favoritos' :
                    'Grupos'}
            </button>
          ))}
        </div>
      )}

      {/* Conversations List or Search Results */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {searchQuery ? (
          // Search Results
          <div className="p-2 space-y-1">
            {isSearching ? (
              <div className="text-center p-4 text-muted-foreground text-sm">Buscando...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(patient => (
                <Card
                  key={patient.id}
                  className="border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <CardContent className="p-3 flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border border-border">
                      {patient.avatar && <AvatarImage src={patient.avatar} />}
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(patient.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{patient.name}</h3>
                      <p className="text-xs text-muted-foreground">Clique para conversar</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm">Nenhum paciente encontrado.</div>
            )}
          </div>
        ) : (
          // Existing Conversation List
          filteredConversations.map((conversation) => {
            const participant = conversation.participants.find(
              p => p.id?.toString() !== currentUserId?.toString()
            );

            return (
              <Card
                key={conversation.id}
                className={cn(
                  'border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group',
                  selectedConversationId === conversation.id && 'bg-primary/10 dark:bg-primary/20 border-l-4 !border-l-primary'
                )}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <CardContent className="p-3 flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-4 border-background shadow-lg flex-shrink-0">
                      {participant?.avatar && <AvatarImage src={participant.avatar} alt={participant.name} />}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                        {getInitials(participant?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-foreground truncate">
                        {participant?.name || 'Paciente'}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {conversation.unread_count > 0 && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => handleClearMessages(conversation.id, e)}>
                              <Eraser className="mr-2 h-4 w-4" />
                              Limpar mensagens
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir conversa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.last_message || 'Nenhuma mensagem'}
                      </p>
                      {conversation.last_message_time && (
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                          {new Date(conversation.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div >
  );
};

interface WhatsAppChatAreaProps {
  conversationId: string;
  currentUserId: string;
}

// Helper to check if string contains only emojis
const isOnlyEmoji = (text: string) => {
  if (!text) return false;
  // Regex para detectar emojis (incluindo variações de tom de pele e sequências ZWJ)
  const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\s)+$/g;
  return emojiRegex.test(text.trim());
};

// Componente apenas para a área de chat
const WhatsAppChatArea: React.FC<WhatsAppChatAreaProps> = ({ conversationId, currentUserId: propCurrentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { theme } = useTheme();
  
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    // Focar no input novamente para permitir o Enter
    setTimeout(() => {
        inputRef.current?.focus();
    }, 10);
  };

  const handleSendLink = (type: string) => {
    if (typeof window === 'undefined') return;
    const baseUrl = window.location.origin;
    
    // Tentar obter o ID do paciente da conversa ou do participante
    const patientParticipant = conversation?.participants.find(p => String(p.id) !== String(currentUserId));
    const patientId = (conversation as any)?.patient_id || patientParticipant?.id;
    
    let linkText = "";
    switch(type) {
        case 'schedule':
            linkText = `Olá! Gostaria de agendar uma consulta? Acesse: ${baseUrl}/patient-dashboard-v2?tab=agenda`;
            break;
        case 'diet':
            linkText = `Seu plano alimentar está disponível! Acesse: ${baseUrl}/patient-dashboard-v2?tab=diet`;
            break;
        case 'evaluation':
            linkText = `Sua avaliação física foi atualizada. Confira: ${baseUrl}/patient-dashboard-v2?tab=evolution`;
            break;
        case 'anamnesis':
            linkText = `Por favor, preencha sua ficha de anamnese para que eu possa conhecer melhor seu perfil: ${baseUrl}/anamnesis/answer?patient=${patientId}&type=standard`;
            break;
    }
    if(linkText) setMessage(linkText);
  };
  
  // Garantir que temos o ID do usuário real
  const { user: authUser } = useAuth();
  const currentUserId = (propCurrentUserId === 'current_user_id' && authUser?.id) 
    ? String(authUser.id) 
    : String(propCurrentUserId);

  // Carregar mensagens da conversa específica
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        // Primeiro tentar obter detalhes da conversa
        let conversationDetails = null;
        try {
          const conversationResponse = await api.get(`/messages/conversations/${conversationId}/`);
          conversationDetails = conversationResponse.data;
        } catch (conversationError) {
          // Se falhar, criar um objeto básico de conversa
          conversationDetails = {
            id: conversationId,
            participants: [],
            created_at: '',
            updated_at: '',
            last_message: '',
            last_message_time: null,
            unread_count: 0
          };
        }

        // Buscar mensagens da conversa
        const response = await api.get(`/messages/messages/?conversation=${conversationId}`);

        // Verificar se há novas mensagens não vistas
        const previousMessageCount = messages.length;
        const newMessages = response.data;

        // Deduplicate messages just in case API returns duplicates or state update race condition
        const uniqueMessages = Array.from(new Map(newMessages.map((m: any) => [m.id, m])).values());

        setMessages(uniqueMessages as Message[]);

        // Atualizar informações da conversa com base nas mensagens, se necessário
        if (!conversationDetails.last_message && newMessages && newMessages.length > 0) {
          const lastMessage = newMessages[newMessages.length - 1];
          conversationDetails.last_message = lastMessage.content;
          conversationDetails.last_message_time = lastMessage.timestamp;
        }

        setConversation(conversationDetails);

        // Verificar se há novas mensagens para o usuário atual (não lidas)
        if (!silent && newMessages.length > previousMessageCount) {
          // Identificar se as novas mensagens são de outro participante (não do usuário atual)
          const newUnreadMessages = newMessages.slice(previousMessageCount).filter(
            msg => {
                const senderId = typeof msg.sender === 'object' ? msg.sender.id : msg.sender;
                return String(senderId) !== String(currentUserId);
            }
          );

          if (newUnreadMessages.length > 0) {
            // Acionar efeito de notificação para novas mensagens
            triggerNotificationVisualEffect();
          }
        }
      } catch (error) {
        if (!silent) console.error('Erro ao carregar mensagens:', error);
        // Em caso de erro, tentar endpoints alternativos
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          try {
            // Tentar endpoint alternativo para mensagens filtrando por conversa
            const messagesResponse = await api.get(`/messages/messages/?conversation=${conversationId}`);
            setMessages(messagesResponse.data);

            // Criar um objeto de conversa básico
            setConversation({
              id: conversationId,
              participants: [],
              created_at: '',
              updated_at: '',
              last_message: messagesResponse.data && messagesResponse.data.length > 0 ?
                messagesResponse.data[0].content : '',
              last_message_time: messagesResponse.data && messagesResponse.data.length > 0 ?
                messagesResponse.data[0].timestamp : null,
              unread_count: 0
            });
          } catch (fallbackError) {
            if (!silent) console.error('Erro ao carregar mensagens com endpoint alternativo:', fallbackError);
          }
        }
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchMessages();

    // Configurar polling para atualizações (a cada 5 segundos)
    const interval = setInterval(() => fetchMessages(true), 5000);

    return () => clearInterval(interval);
  }, [conversationId, currentUserId]);

  // Auto-scroll para o final quando novas mensagens são adicionadas
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll para o final quando mensagens mudam, mas apenas se estiver perto do fundo ou for a primeira carga
  useEffect(() => {
    // Se for a primeira carga (loading acabou de virar false), rola pro fim
    if (!loading && messages.length > 0) {
       scrollToBottom('auto');
    }
  }, [loading]); // Executa quando o loading termina

  // Ref para controlar se devemos auto-scrollar
  const shouldAutoScrollRef = React.useRef(true);

  // Monitorar scroll do usuário para desativar auto-scroll se ele subir
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Se a distância do fundo for maior que 100px, o usuário subiu a tela
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 100;
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
        scrollToBottom();
    }
  }, [messages]);

  const handleClearMessages = async (convId: string) => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico desta conversa?')) return;

    try {
      await api.post(`/messages/conversations/${convId}/clear-messages/`);
      setMessages([]);
      alert('Histórico limpo com sucesso!');
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Erro ao limpar histórico.');
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conversa? Todas as mensagens serão perdidas.')) return;

    try {
      await api.delete(`/messages/conversations/${convId}/`);
      alert('Conversa excluída com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Erro ao excluir conversa.');
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      // Enviar mensagem através da API
      const response = await api.post(`/messages/messages/`, {
        content: message,
        conversation: conversationId
      });

      // Adicionar nova mensagem à lista, evitando duplicatas
      setMessages(prev => {
          if (prev.some(m => m.id === response.data.id)) return prev;
          return [...prev, response.data];
      });
      setMessage('');
      
      // Forçar scroll para o fim ao enviar mensagem
      shouldAutoScrollRef.current = true;
      setTimeout(() => scrollToBottom(), 100);

      // Atualizar a lista de conversas para refletir a nova mensagem
      // (Isso pode ser feito via atualização imediata ou via polling)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Tratar erro de envio
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  // Identificar o outro participante (paciente)
  // Se o usuário atual NÃO for o participante, então o outro é... espera.
  // Participants inclui EU e o PACIENTE.
  // Quero achar o participante que NÃO sou eu.
  const patientParticipant = conversation?.participants.find(p => String(p.id) !== String(currentUserId));

  return (
    <div className="flex flex-col h-full" style={{ overflow: 'hidden', maxHeight: '100%' }}>
      {/* Chat Header - only shows when conversation is selected */}
      <div className="bg-background text-foreground p-4 flex items-center justify-between border-b flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg flex-shrink-0">
              {patientParticipant?.avatar && (
                <AvatarImage
                  src={patientParticipant.avatar}
                  alt={patientParticipant.name || ''}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials(patientParticipant?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {patientParticipant?.name || 'Paciente'}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="text-foreground hover:bg-accent">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleClearMessages(conversationId)}>
                <Eraser className="mr-2 h-4 w-4" />
                Limpar histórico
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleDeleteConversation(conversationId)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 min-h-0 p-4 space-y-3 bg-muted/30 dark:bg-muted/10"
        onScroll={handleScroll}
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
        }}
      >
        {messages.map((msg) => {
          // Extrair ID do remetente de forma robusta
          const senderId = typeof msg.sender === 'object' ? msg.sender.id : msg.sender;
          
          // Verificar se a mensagem é do usuário atual (Nutricionista)
          const isOwn = String(senderId) === String(currentUserId);
          const onlyEmoji = isOnlyEmoji(msg.content);
          
          // Helper function to render text with clickable links
          const renderMessageContent = (content: string) => {
              if (onlyEmoji) return content;
              const urlRegex = /(https?:\/\/[^\s]+)/g
              const parts = content.split(urlRegex)

              return parts.map((part, i) => {
                  if (part.match(urlRegex)) {
                      let href = part;
                      // Fix legacy placeholder links
                      if (part.includes('nutri.app') && typeof window !== 'undefined') {
                          const patientParticipant = conversation?.participants.find(p => String(p.id) !== String(currentUserId));
                          const patientId = (conversation as any)?.patient_id || patientParticipant?.id;

                          // Redirecionamentos inteligentes para links legados
                          if (part.includes('/anamnese') || part.includes('/anamnesis')) {
                              href = `${window.location.origin}/anamnesis/answer?patient=${patientId}&type=standard`;
                          } else if (part.includes('/agendamento')) {
                              href = `${window.location.origin}/patient-dashboard-v2?tab=agenda`;
                          } else if (part.includes('/dieta')) {
                              href = `${window.location.origin}/patient-dashboard-v2?tab=diet`;
                          } else if (part.includes('/evolucao')) {
                              href = `${window.location.origin}/patient-dashboard-v2?tab=evolution`;
                          } else {
                              href = part.replace('https://nutri.app', window.location.origin);
                          }
                      }
                      
                      return (
                          <a
                              key={i}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`underline break-all font-semibold ${isOwn ? 'text-white' : 'text-emerald-700 hover:text-emerald-800'}`}
                              onClick={(e) => e.stopPropagation()}
                          >
                              {part}
                          </a>
                      )
                  }
                  return part
              })
          }
          
          return (
            <div
              key={msg.id}
              className={cn(
                'flex w-full',
                isOwn ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] md:max-w-[70%] lg:max-w-[60%] px-4 py-2 shadow-sm relative',
                  onlyEmoji 
                    ? 'bg-transparent shadow-none border-none' 
                    : isOwn
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none' 
                      : 'bg-card text-card-foreground border border-border/50 rounded-2xl rounded-tl-none'
                )}
              >
                <div className={cn(
                    "whitespace-pre-wrap leading-relaxed",
                    onlyEmoji ? "text-5xl" : "text-sm"
                )}>
                    {renderMessageContent(msg.content)}
                </div>
                <div
                  className={cn(
                    'text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70',
                    onlyEmoji 
                      ? 'text-muted-foreground' 
                      : isOwn
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                  )}
                >
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isOwn && (
                    <span className="ml-0.5">
                      {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} id="messages-end" />
      </div>

      {/* Message Input Area */}
      <div className="bg-muted p-3 flex items-center space-x-2 flex-shrink-0 relative z-20">
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-accent">
                    <Smile className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" align="start" side="top">
                <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    searchDisabled={false}
                    skinTonesDisabled
                    width={300}
                    height={400}
                />
            </PopoverContent>
        </Popover>

        <Popover>
            <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:bg-accent">
                    <Paperclip className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start" side="top">
                <div className="grid gap-1">
                    <Button variant="ghost" className="justify-start gap-2 h-9" onClick={() => alert("Upload de imagem em breve!")}>
                        <ImageIcon className="w-4 h-4 text-purple-500" />
                        <span>Foto/Vídeo</span>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 h-9" onClick={() => alert("Upload de documento em breve!")}>
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span>Documento</span>
                    </Button>
                    <DropdownMenuSeparator />
                    <Button variant="ghost" className="justify-start gap-2 h-9" onClick={() => handleSendLink('schedule')}>
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Agendamento</span>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 h-9" onClick={() => handleSendLink('diet')}>
                        <Utensils className="w-4 h-4 text-green-500" />
                        <span>Plano Alimentar</span>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 h-9" onClick={() => handleSendLink('evaluation')}>
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span>Avaliação</span>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 h-9" onClick={() => handleSendLink('anamnesis')}>
                        <ClipboardList className="w-4 h-4 text-cyan-500" />
                        <span>Anamnese</span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>

        <div className="flex-1 bg-background rounded-lg px-3 py-2 border">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
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
    </div >
  );
};

// Atualizar o componente principal para exportar o ChatArea como sub-componente
const WhatsAppStyleMessages = Object.assign(WhatsAppConversationsList, {
  ChatArea: WhatsAppChatArea
});

export default WhatsAppStyleMessages;