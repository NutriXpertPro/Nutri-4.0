'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import WhatsAppStyleMessages from '@/components/organisms/WhatsAppStyleMessages';
import { initializeNotificationService } from '@/services/notification-service';

const XpertMessengerPage: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  // Inicializar o serviço de notificação e bloquear scroll global quando nesta página
  useEffect(() => {
    // Inicializar serviço de notificação
    initializeNotificationService();

    // Salvar o estilo original
    const originalStyle = document.body.style.overflow;
    const originalHtmlStyle = document.documentElement.style.overflow;

    // Bloquear scroll global
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Restaurar ao sair da página
    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
    };
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 4rem - 3rem)', maxHeight: 'calc(100vh - 4rem - 3rem)' }}>
      {/* Conversations List - Left Panel */}
      <div className="w-1/3 border-r bg-background flex flex-col" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
        <div className="p-4 border-b flex-shrink-0">
          <h1 className="text-xl font-normal text-foreground">Xpert Messenger</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="w-4 h-4">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
            </div>
            Converse com seus pacientes
          </div>
        </div>
        <div className="flex-1 min-h-0" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <WhatsAppStyleMessages
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleSelectConversation}
          />
        </div>
      </div>

      {/* Chat Area - Right Panel */}
      <div className="w-2/3 bg-background flex flex-col" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
        {selectedConversationId ? (
          <WhatsAppStyleMessages.ChatArea
            conversationId={selectedConversationId}
            currentUserId={user?.id?.toString() || 'current_user_id'}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Xpert Messenger</h2>
              <div className="text-muted-foreground max-w-md">
                Selecione uma conversa para começar a conversar com seu paciente.
                Mantenha-se em contato para melhorar o acompanhamento nutricional.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XpertMessengerPage;