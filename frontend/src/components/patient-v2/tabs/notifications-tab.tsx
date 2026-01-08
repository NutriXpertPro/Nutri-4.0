"use client"

import React, { useState, useEffect } from 'react'
import { Bell, MessageSquare, Calendar, UtensilsCrossed, User, Check, CheckCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils'
import api from '@/services/api'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Notification {
    id: string
    type: 'message' | 'appointment' | 'diet' | 'evaluation' | 'lab_exam' | 'system' | 'payment'
    title: string
    message: string
    timestamp: string
    is_read: boolean
    related_id?: string
    patient_pid?: string
    user_name?: string
    patient_avatar?: string
}

export function NotificationsTab({ onNavigate, onBack }: { onNavigate: (tab: string) => void, onBack?: () => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await api.get('notifications/')

            const formatted = response.data.map((item: any) => {
                let message = item.message || ''
                // Extract IDs from message [ID:xxx] [PID:xxx]
                const idMatch = message.match(/\[ID:([^\]]+)\]/)
                const pidMatch = message.match(/\[PID:([^\]]+)\]/)

                const cleanMessage = message.replace(/\[ID:[^\]]+\]/g, '').replace(/\[PID:[^\]]+\]/g, '').trim()

                return {
                    id: item.id.toString(),
                    type: (item.notification_type || 'system').toLowerCase(),
                    title: item.title || 'Notificação',
                    message: cleanMessage,
                    timestamp: item.sent_at || item.created_at,
                    is_read: item.is_read || false,
                    user_name: item.patient_name || undefined,
                    related_id: idMatch ? idMatch[1] : undefined,
                    patient_pid: pidMatch ? pidMatch[1] : undefined,
                    patient_avatar: item.patient_avatar || undefined
                }
            })
            setNotifications(formatted)
            setError(null)
        } catch (err) {
            console.error('Error fetching notifications:', err)
            setError('Não foi possível carregar as notificações.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`notifications/${id}/mark_as_read/`)
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const handleNotificationClick = (notif: Notification) => {
        if (notif.type === 'message' || notif.message.toLowerCase().includes('mensagem')) {
            onNavigate('messages')
        } else if (notif.type === 'diet' || notif.message.toLowerCase().includes('dieta')) {
            onNavigate('diet')
        } else if (notif.type === 'appointment' || notif.message.toLowerCase().includes('consulta')) {
            onNavigate('agenda')
        }

        if (!notif.is_read) {
            markAsRead(notif.id)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />
            case 'appointment': return <Calendar className="w-5 h-5 text-amber-500" />
            case 'diet': return <UtensilsCrossed className="w-5 h-5 text-green-500" />
            default: return <Bell className="w-5 h-5 text-primary" />
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Buscando notificações...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{error}</p>
                <Button onClick={fetchNotifications} variant="link">Tentar de novo</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center gap-2 mb-2">
                {onBack && (
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted/10 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-2xl font-bold">Notificações</h1>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-20 bg-card/40 rounded-3xl border border-border/10">
                    <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma notificação por enquanto.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {notifications.map((notif, i) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card
                                onClick={() => handleNotificationClick(notif)}
                                className={cn(
                                    "overflow-hidden cursor-pointer transition-all active:scale-[0.98] border-border/10 bg-card/60 backdrop-blur-md hover:bg-card/80",
                                    !notif.is_read && "border-l-4 border-l-primary"
                                )}
                            >
                                <CardContent className="p-4 flex gap-4">
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-sm truncate">{notif.title}</h3>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                {new Date(notif.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
