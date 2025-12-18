'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import WhatsAppStyleMessages from '@/components/organisms/WhatsAppStyleMessages';
import { initializeNotificationService } from '@/services/notification-service';

const MessagesPage: React.FC = () => {
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
          <h1 className="text-xl font-bold text-foreground">Mensagens</h1>
          <p className="text-sm text-muted-foreground">Converse com seus pacientes</p>
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
            currentUserId={user?.id?.toString() || user?.id || 'current_user_id'}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="mx-auto bg-muted rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">NutriXpertPro Chat</h2>
              <p className="text-muted-foreground max-w-md">
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