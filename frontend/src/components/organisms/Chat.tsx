'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Message, Conversation, UserType } from '@/types/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Phone, Video, MoreVertical, Search, User, Check, CheckCheck, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBaseURL } from '@/services/api';

interface ChatProps {
  conversationId: string;
  currentUserId: string;
}

const Chat: React.FC<ChatProps> = ({ conversationId, currentUserId }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages for this conversation
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await fetch(`${getBaseURL()}messages/conversations/${conversationId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      // Convertendo os dados para o formato Message
      return data.map((msg: any) => ({
        ...msg,
        sender: {
          id: msg.sender.toString(),
          name: msg.sender_name || 'Unknown',
          email: msg.sender_email || ''
        }
      }));
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Mutation to send a message
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: string) => {
      const response = await fetch(`${getBaseURL()}messages/conversations/${conversationId}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      setMessage('');
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Carregando mensagens...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h2 className="font-semibold">Paciente Exemplo</h2>
            <p className="text-xs opacity-80">Online</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary/80">
            <Phone className="w-5 h-5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary/80">
            <Video className="w-5 h-5" />
          </Button>
          <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary/80">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
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
                'max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2',
                msg.sender.id === currentUserId
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-muted text-muted-foreground rounded-tl-none'
              )}
            >
              <p>{msg.content}</p>
              <div
                className={cn(
                  'text-xs mt-1 flex items-center justify-end',
                  msg.sender.id === currentUserId
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground/80'
                )}
              >
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender.id === currentUserId && (
                  <span className="ml-1">
                    {msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="bg-muted p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="flex-1"
          />
          <Button size="sm" variant="ghost" className="text-muted-foreground">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={message.trim() === '' || sendMessageMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;