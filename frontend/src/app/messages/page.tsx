'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import ConversationList from '@/components/organisms/ConversationList';
import Chat from '@/components/organisms/Chat';
import { Card, CardContent } from '@/components/ui/card';

const MessagesPage: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useAuth(); // Using correct context name

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Conversations List - Left Panel */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mensagens</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Converse com seus pacientes</p>
        </div>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          currentConversationId={selectedConversationId || undefined}
        />
      </div>

      {/* Chat Area - Right Panel */}
      <div className="w-2/3 flex flex-col">
        {selectedConversationId ? (
          <Chat
            conversationId={selectedConversationId}
            currentUserId={user?.id?.toString() || 'current_user_id'}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center p-8">
              <div className="mx-auto bg-gray-200 dark:bg-gray-700 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">NutriXpertPro Chat</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Selecione uma conversa para começar a trocar mensagens com seu paciente.
                Mantenha-se em contato para melhorar o acompanhamento nutricional.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;