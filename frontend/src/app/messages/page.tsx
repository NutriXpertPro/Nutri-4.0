'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import WhatsAppStyleMessages from '@/components/organisms/WhatsAppStyleMessages';
import { initializeNotificationService } from '@/services/notification-service';
import { MessageSquare, Loader2 } from 'lucide-react';
import { IconWrapper } from '@/components/ui/IconWrapper';

const XpertMessengerContent: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const searchParams = useSearchParams();
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

  // Verificar se há um ID de conversa na URL ao carregar a página
  useEffect(() => {
    const conversationId = searchParams?.get('conversation');
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [searchParams]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 4rem - 3rem)', maxHeight: 'calc(100vh - 4rem - 3rem)' }}>
      {/* Conversations List - Left Panel */}
      <div className="w-1/3 border-r bg-background flex flex-col" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
        <div className="p-4 border-b flex-shrink-0">
          <h1 className="text-xl font-normal text-foreground mb-2">
            <span className="text-emerald-500 font-bold drop-shadow-[0_1px_4px_rgba(16,185,129,0.2)]">
              <span className="text-3xl font-black">X</span>pert
            </span>
            <span className="ml-1 text-[#000000] font-bold">Messenger</span>
          </h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            Converse com seus pacientes
          </div>
        </div>
        <div className="flex-1 min-h-0" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
          <WhatsAppStyleMessages
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleSelectConversation}
            currentUserId={user?.id?.toString() || null}
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
              <IconWrapper
                icon={MessageSquare}
                variant="green"
                size="xl"
                glow
                className="mx-auto mb-4 ring-4 ring-background border border-white/10 dark:border-white/20 shadow-lg"
              />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                <span className="text-emerald-500 font-bold drop-shadow-[0_1px_4px_rgba(16,185,129,0.2)]">
                  <span className="text-3xl font-black">X</span>pert
                </span>
                <span className="ml-1 text-[#000000] font-bold">Messenger</span>
              </h2>
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

export default function XpertMessengerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <XpertMessengerContent />
    </Suspense>
  );
}