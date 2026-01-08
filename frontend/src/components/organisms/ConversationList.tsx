'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Conversation, UserType } from '@/types/chat';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBaseURL } from '@/services/api';

// Helper function to get initials from a name
const getInitials = (name?: string) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  currentConversationId
}) => {
  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch(`${getBaseURL()}messages/conversations/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      // Convertendo os dados para o formato Conversation
      return data.map((conv: any) => ({
        ...conv,
        participants: conv.participants.map((p: any) => ({
          id: p.id.toString(),
          name: p.name || p.email || 'Unknown',
          email: p.email || ''
        }))
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-gray-500">Carregando conversas...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Search Bar */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar conversas..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          // Get participant name (excluding current user)
          const participant = conversation.participants.find(
            p => p.id !== 'current_user_id' // This would be replaced with actual current user ID
          );

          // Get last message
          const lastMessage = conversation.last_message;

          return (
            <Card
              key={conversation.id}
              className={cn(
                'border-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
                currentConversationId === conversation.id &&
                'bg-green-100 dark:bg-green-900/30 border-r-4 border-green-500'
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <CardContent className="p-3 flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {getInitials(participant?.name)}
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

                  {lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {lastMessage}
                    </p>
                  )}
                  {!lastMessage && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      Nenhuma mensagem ainda
                    </p>
                  )}
                </div>

                {conversation.unread_count > 0 && (
                  <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;