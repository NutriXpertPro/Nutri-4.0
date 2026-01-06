"use client"

import { Calendar, MapPin, Video, Clock, MessageSquare, X, Check, Plus, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppointments } from "@/hooks/useAppointments"

interface AgendaTabProps {
    onNavigate?: (tab: string) => void
}

export function AgendaTab({ onNavigate }: AgendaTabProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
    const [showConfirmation, setShowConfirmation] = useState(true)

    // Use API hook based on active tab
    const {
        appointments,
        loading,
        error,
        confirmAppointment,
        cancelAppointment
    } = useAppointments(activeTab === 'upcoming' ? 'upcoming' : 'past')

    const handleConfirm = async (appointmentId: number) => {
        try {
            await confirmAppointment(appointmentId)
            setShowConfirmation(false)
        } catch (err) {
            console.error('Failed to confirm appointment:', err)
        }
    }

    const handleCancel = async (id: number) => {
        try {
            await cancelAppointment(id)
        } catch (err) {
            console.error('Failed to cancel appointment:', err)
        }
    }

    const handleOpenRoom = (url: string) => {
        window.open(url, '_blank')
    }

    const handleMessage = () => {
        if (onNavigate) {
            onNavigate('messages')
        }
    }

    return (
        <div className="space-y-6 pb-24 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Agenda</h1>
                <p className="text-muted-foreground text-sm">Gerencie suas consultas e horários.</p>
            </div>

            {/* Confirmation Card (Interactive) - Only show if there's a pending appointment */}
            <AnimatePresence>
                {(() => {
                    const pendingAppointment = appointments.find(apt => apt.status === 'scheduled')
                    if (!pendingAppointment || !showConfirmation) return null

                    // Parse date for display
                    const dateObj = new Date(pendingAppointment.date)
                    const day = dateObj.getDate()
                    const month = dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
                    const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10 rounded-3xl p-6 text-center relative overflow-hidden group"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />

                            <div className="relative z-10">
                                <h2 className="text-lg font-semibold mb-1 text-foreground">Confirmação Pendente</h2>
                                <p className="text-muted-foreground text-sm mb-4">{pendingAppointment.title}</p>

                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-foreground leading-none">{day}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{month}</div>
                                    </div>
                                    <div className="h-8 w-px bg-border" />
                                    <div className="text-left">
                                        <div className="text-3xl font-bold text-primary leading-none">{pendingAppointment.time}</div>
                                        <div className="text-xs text-primary/80 uppercase tracking-wider font-bold capitalize">{dayOfWeek}</div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-border/10 hover:bg-muted hover:text-foreground text-muted-foreground"
                                        onClick={() => setShowConfirmation(false)}
                                    >
                                        Rejeitar
                                    </Button>
                                    <Button
                                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] border-0"
                                        onClick={() => handleConfirm(pendingAppointment.id)}
                                    >
                                        Confirmar
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })()}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/10">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === 'upcoming' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Próximas
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${activeTab === 'history' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Histórico
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'upcoming' ? (
                        <motion.div
                            key="upcoming"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-4"
                        >
                            {appointments.map((apt) => (
                                <motion.div
                                    key={apt.id}
                                    layout
                                    className={`relative bg-card border border-border/10 rounded-2xl p-5 hover:bg-card/60 transition-colors shadow-sm ${apt.status === 'cancelled' ? 'opacity-50 grayscale' : ''}`}
                                >
                                    {/* Header Card */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm border border-border/10">
                                                {apt.avatar}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground text-sm">{apt.title}</h3>
                                                <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className={`${apt.type === 'Online' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'} border-0`}>
                                            {apt.type}
                                        </Badge>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {apt.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {apt.time}
                                        </div>
                                        {apt.type === 'Presencial' && (
                                            <div className="col-span-2 flex items-start gap-2 text-sm text-muted-foreground mt-1">
                                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <span className="truncate">{apt.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {apt.status !== 'cancelled' && (
                                        <div className="flex gap-2">
                                            {apt.type === 'Online' && (
                                                <Button
                                                    onClick={() => handleOpenRoom(apt.videoLink || '')}
                                                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-0 h-9 text-xs font-semibold">
                                                    <Video className="w-3.5 h-3.5 mr-2" />
                                                    Entrar na Sala
                                                </Button>
                                            )}
                                            <Button
                                                onClick={handleMessage}
                                                variant="outline" size="icon" className="h-9 w-9 border-border/10 bg-muted/20 text-muted-foreground hover:bg-muted">
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="h-9 px-3 text-red-400 hover:text-red-500 hover:bg-red-500/10 text-xs"
                                                onClick={() => handleCancel(apt.id)}
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            {appointments.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">Nenhum histórico disponível.</div>
                            ) : (
                                appointments.map((apt) => (
                                    <div key={apt.id} className="bg-card/40 border border-border/10 rounded-2xl p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-medium text-foreground text-sm">{apt.title}</h3>
                                                <p className="text-xs text-muted-foreground">{apt.date} • {apt.time}</p>
                                            </div>
                                            <Badge variant={apt.status === 'completed' ? 'default' : 'destructive'} className="text-[10px] uppercase">
                                                {apt.status === 'completed' ? 'Concluída' : 'Cancelada'}
                                            </Badge>
                                        </div>
                                        {apt.notes && (
                                            <div className="mt-3 p-3 bg-muted/20 rounded-lg border border-border/5">
                                                <p className="text-xs text-muted-foreground italic">"{apt.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-24 right-4 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground z-40"
            >
                <Plus className="w-6 h-6" />
            </motion.button>
        </div>
    )
}

