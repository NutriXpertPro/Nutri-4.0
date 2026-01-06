import { useState, useEffect } from 'react'
import { messagesAPI } from '@/services/api'

interface Message {
    id: number
    content: string
    sender: string
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
            setConversations(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar conversas')
            console.error('Error fetching conversations:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (conversationId: number) => {
        try {
            setLoading(true)
            const response = await messagesAPI.getMessages(conversationId)
            setMessages(response.data)
            setSelectedConversation(conversationId)
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
            setMessages(prev => [...prev, response.data])
            return response.data
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao enviar mensagem')
            console.error('Error sending message:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchConversations()
    }, [])

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
