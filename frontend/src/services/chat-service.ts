// Configurações para o sistema de mensagens
export const chatConfig = {
  // Intervalo de polling para atualização de mensagens (em milissegundos)
  POLLING_INTERVAL: 5000,
  
  // Número máximo de mensagens a serem exibidas por vez (para performance)
  MAX_MESSAGES_DISPLAY: 100,
  
  // Tamanho máximo de uma mensagem (em caracteres)
  MAX_MESSAGE_LENGTH: 1000,
  
  // Tamanho máximo para uploads de arquivos (em bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Tipos de arquivos permitidos para upload
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ],
  
  // Cores para diferentes tipos de status
  STATUS_COLORS: {
    sent: 'text-gray-500',
    delivered: 'text-green-500',
    read: 'text-green-600'
  },
  
  // Tipos de notificação
  NOTIFICATION_TYPES: {
    MESSAGE_RECEIVED: 'message_received',
    CONVERSATION_UPDATED: 'conversation_updated',
    USER_ONLINE: 'user_online'
  },
  
  // Tempos de cache para diferentes tipos de dados
  CACHE_TIME: {
    CONVERSATIONS: 1000 * 60 * 2, // 2 minutos
    MESSAGES: 1000 * 30, // 30 segundos
    USER_STATUS: 1000 * 10 // 10 segundos
  }
};