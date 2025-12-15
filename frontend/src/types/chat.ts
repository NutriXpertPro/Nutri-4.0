// src/types/chat.ts

export interface UserType {
  id: string | number; // O ID do usuário pode ser number conforme o contexto de autenticação
  name: string;
  email: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: UserType;
  content: string;
  timestamp: string; // ISO string
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participants: UserType[];
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}