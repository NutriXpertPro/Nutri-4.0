"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    MapPin,
    Video,
    Phone,
    MessageSquare,
    ChevronRight
} from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { format, parseISO, isToday, isAfter, isBefore, addMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import api from "@/services/api"
import { toast } from "sonner"

export interface Appointment {
    id: string
    time: string
    patientName: string
    patientAvatar?: string
    type: "presencial" | "online"
    duration: number // em minutos
    description?: string
    isNow?: boolean
}

interface AgendaDoDiaProps {
    appointments?: Appointment[]
    className?: string
    hideViewAgendaButton?: boolean
}

// Mock data - será substituído por dados da API
const mockAppointments: Appointment[] = [
    {
        id: "1",
        time: "09:00",
        patientName: "Maria Silva",
        type: "presencial",
        duration: 60,
        description: "Avaliação Inicial",
    },
    {
        id: "2",
        time: "10:30",
        patientName: "João Santos",
        type: "online",
        duration: 45,
        description: "Retorno Online",
    },
    {
        id: "3",
        time: "14:30",
        patientName: "Ana Costa",
        type: "presencial",
        duration: 60,
        description: "Ajuste de Dieta",
        isNow: true,
    },
    {
        id: "4",
        time: "16:00",
        patientName: "Carlos Oliveira",
        type: "online",
        duration: 30,
        description: "Acompanhamento",
    },
]

export function AgendaDoDia({ appointments = mockAppointments, className, hideViewAgendaButton = false }: AgendaDoDiaProps) {
    const router = useRouter();

    const handleOpenMessage = async (appointment: Appointment) => {
        try {
            // Primeiro, tentamos encontrar uma conversa existente com o paciente
            const response = await api.get('messages/conversations/');
            const conversations = response.data;

            // Procurar uma conversa que contenha o paciente como participante
            let conversation = conversations.find((conv: any) =>
                conv.participants.some((p: any) => p.name === appointment.patientName)
            );

            // Se não encontrar uma conversa existente, criamos uma nova
            if (!conversation) {
                // Para criar uma nova conversa, precisamos do ID do paciente
                // Isso exigiria uma chamada adicional para obter o ID do paciente pelo nome
                const patientsResponse = await api.get('patients/');
                const patient = patientsResponse.data.find((p: any) => p.user.name === appointment.patientName);

                if (patient) {
                    const newConversationResponse = await api.post('messages/conversations/', {
                        participants: [patient.id]
                    });
                    conversation = newConversationResponse.data;
                }
            }

            // Navegar para a página de mensagens com o ID da conversa
            if (conversation) {
                router.push(`/messages?conversation=${conversation.id}`);
            } else {
                router.push('/messages');
            }
        } catch (error) {
            console.error('Erro ao abrir conversa com o paciente:', error);
            // Se houver erro, redirecionar para a página de mensagens genérica
            router.push('/messages');
        }
    };

    const handleShareLink = () => {
        console.log('handleShareLink chamado!');
        const calendarUrl = `${window.location.origin}/calendar`;
        console.log('URL a ser copiada:', calendarUrl);

        if (!navigator.clipboard) {
            console.error('API de clipboard não disponível');
            toast.error('Seu navegador não suporta copiar para área de transferência');
            return;
        }

        navigator.clipboard.writeText(calendarUrl)
            .then(() => {
                console.log('Link copiado com sucesso!');
                toast.success('Link copiado para área de transferência!');
            })
            .catch(err => {
                console.error('Erro ao copiar link:', err);
                toast.error('Erro ao copiar link. Tente novamente.');
            });
    };

    return (
        <Card variant="glass" className={cn("h-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-4">
                    <IconWrapper
                        icon={Calendar}
                        variant="amber"
                        size="xl"
                        className="ring-4 ring-background border border-white/10 dark:border-white/20 shadow-md"
                    />
                    <CardTitle className="text-lg">
                        Agenda de Hoje
                    </CardTitle>
                </div>
                <Badge variant="secondary" className="font-normal">
                    {appointments.length} consultas
                </Badge>
            </CardHeader>
            <CardContent className="space-y-1">
                {/* Timeline */}
                <div className="relative">
                    {/* Linha vertical da timeline */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                    {appointments.map((appointment, index) => (
                        <div
                            key={appointment.id}
                            className={cn(
                                "relative flex items-start gap-4 py-3 pl-10",
                                appointment.isNow && "bg-primary/5 -mx-6 px-6 pl-16 rounded-lg"
                            )}
                        >
                            {/* Timeline dot */}
                            <div
                                className={cn(
                                    "absolute left-3 top-5 w-3 h-3 rounded-full border-2 bg-background",
                                    appointment.isNow
                                        ? "border-primary bg-primary animate-pulse"
                                        : "border-muted-foreground"
                                )}
                            />

                            {/* Time */}
                            <div className="flex-shrink-0 w-12 text-sm">
                                {appointment.time}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                                        {appointment.patientName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">
                                            {appointment.patientName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {appointment.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Type & Duration Badge */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "gap-1 text-xs",
                                        appointment.type === "online"
                                            ? "border-blue-500/50 text-blue-600"
                                            : "border-green-500/50 text-green-600"
                                    )}
                                >
                                    {appointment.type === "online" ? (
                                        <Video className="h-3 w-3" />
                                    ) : (
                                        <MapPin className="h-3 w-3" />
                                    )}
                                    {appointment.duration}min
                                </Badge>
                            </div>

                            {/* AGORA indicator */}
                            {appointment.isNow && (
                                <Badge className="absolute right-6 top-1/2 -translate-y-1/2 bg-primary animate-pulse">
                                    AGORA
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>

                {/* Ações rápidas */}
                <div className="flex items-center gap-2 pt-4 border-t mt-4">
                    <Button size="sm" variant="ghost" className="flex-1 gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={() => appointments.length > 0 ? handleOpenMessage(appointments[0]) : router.push('/messages')}>
                        <MessageSquare className="h-4 w-4" />
                        Mensagem
                    </Button>
                    <Button size="sm" className="flex-1 gap-2" onClick={handleShareLink}>
                        Enviar Link
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton for loading
export function AgendaDoDiaSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="h-6 w-36 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}