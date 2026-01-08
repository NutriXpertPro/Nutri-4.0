import { useState, useEffect } from 'react'
import { messagesAPI } from '@/services/api'

interface Message {
    id: number
    content: string
    sender: number | any
    timestamp: string
    isOwn: boolean
}

interface Conversation {
    id: number
    name: string
    lastMessage: string
    timestamp: string
    unread: number
    avatar?: string
    participants?: {
        id: number;
        name: string;
        avatar?: string;
        professional_title?: string;
        user_type?: string;
    }[]
}

export function useMessages() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchConversations = async () => {
        try {
            setLoading(true)
            const response = await messagesAPI.getConversations()
            // Map backend snake_case to frontend camelCase
            const mappedConversations = response.data.map((conv: any) => ({
                ...conv,
                lastMessage: conv.last_message || '',
                timestamp: conv.last_message_time || conv.updated_at,
                unread: conv.unread_count || 0
            }))
            setConversations(mappedConversations)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar conversas')
            console.error('Error fetching conversations:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId: number) => {
        if (!conversationId) {
            setSelectedConversation(null)
            return
        }
        try {
            setLoading(true)
            const response = await messagesAPI.getMessages(conversationId)
            const mappedMessages = response.data.map((msg: any) => ({
                ...msg
            }))

            setMessages(mappedMessages)
            setSelectedConversation(conversationId)

            // Mark all as read in the backend
            messagesAPI.markAllAsRead(conversationId)
                .then(() => {
                    // Update local unread counts
                    setConversations(prev => prev.map(c =>
                        c.id === conversationId ? { ...c, unread: 0 } : c
                    ))
                })
                .catch(console.error)

            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar mensagens')
            console.error('Error fetching messages:', err)
        } finally {
            setLoading(false)
        }
    }

    const sendMessage = async (conversationId: number, content: string) => {
        try {
            const response = await messagesAPI.sendMessage(conversationId, content)
            const newMessage = {
                ...response.data
            }
            setMessages(prev => [...prev, newMessage])
            return newMessage
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao enviar mensagem')
            console.error('Error sending message:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchConversations()

        // Poll for inbox updates every 15 seconds
        const inboxInterval = setInterval(() => {
            // Silently fetch to avoid loading spinners flickering
            messagesAPI.getConversations()
                .then(res => {
                    const mapped = res.data.map((conv: any) => ({
                        ...conv,
                        lastMessage: conv.last_message || '',
                        timestamp: conv.last_message_time || conv.updated_at,
                        unread: conv.unread_count || 0
                    }))
                    setConversations(mapped)
                })
                .catch(console.error)
        }, 15000)

        return () => clearInterval(inboxInterval)
    }, [])

    useEffect(() => {
        if (!selectedConversation) return

        // Poll for active chat updates every 5 seconds
        const chatInterval = setInterval(() => {
            messagesAPI.getMessages(selectedConversation)
                .then(res => {
                    const mapped = res.data.map((msg: any) => ({
                        ...msg
                    }))
                    setMessages(mapped)

                    // If there are unread messages from the other person, mark as read
                    if (res.data.some((m: any) => !m.is_read)) {
                        messagesAPI.markAllAsRead(selectedConversation)
                            .then(() => {
                                setConversations(prev => prev.map(c =>
                                    c.id === selectedConversation ? { ...c, unread: 0 } : c
                                ))
                            })
                    }
                })
                .catch(console.error)
        }, 5000)

        return () => clearInterval(chatInterval)
    }, [selectedConversation])

    return {
        conversations,
        messages,
        selectedConversation,
        loading,
        error,
        fetchMessages,
        sendMessage,
        refetch: fetchConversations
    }
}
