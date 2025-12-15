"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
    Clock,
    MapPin,
    Video,
    Phone,
    MessageSquare,
    ChevronRight,
    User,
    Users,
    Target,
    HeartPulse
} from "lucide-react"
import { format, parseISO, isToday, isAfter, isBefore, addMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { AppointmentCard } from "./AppointmentCard"
import { GoogleCalendarSync } from "./GoogleCalendarSync"
import { PatientScheduleLink } from "./PatientScheduleLink"

interface Appointment {
    id: number
    patientId: number
    patientName: string
    patientEmail: string
    date: string
    duration: number
    type: "presencial" | "online" | "primeira_vez" | "retorno" | "em_grupo" | "pacote" | "permuta" | "pessoal" | "antropometria" | "amigo" | "encaixe" | "teste"
    status: "agendada" | "confirmada" | "realizada" | "cancelada" | "faltou"
    meetingLink?: string
    notes?: string
}

interface AgendaDoDiaProps {
    appointments: Appointment[]
    onAddAppointment?: (date: Date) => void
    onEditAppointment?: (id: number) => void
    onDeleteAppointment?: (id: number) => void
    onViewAppointment?: (id: number) => void
    onStatusChange?: (id: number, newStatus: string) => void
    className?: string
}

// Mock data - será substituído por dados da API
const mockAppointments: Appointment[] = [
    {
        id: 1,
        date: new Date().toISOString().replace('T', 'T09:00'),
        patientName: "Maria Silva",
        duration: 60,
        type: "presencial",
        status: "confirmada",
        notes: "Avaliação inicial"
    },
    {
        id: 2,
        date: new Date().toISOString().replace('T', 'T10:30'),
        patientName: "João Santos",
        duration: 45,
        type: "online",
        status: "agendada",
        meetingLink: "https://meet.google.com/xxx-xxxx",
        notes: "Retorno online"
    },
    {
        id: 3,
        date: new Date().toISOString().replace('T', 'T14:30'),
        patientName: "Ana Costa",
        duration: 60,
        type: "presencial",
        status: "agendada",
        notes: "Consulta de rotina"
    }
]

export function AgendaDoDia({ 
    appointments = mockAppointments,
    onAddAppointment,
    onEditAppointment,
    onDeleteAppointment,
    onViewAppointment,
    onStatusChange,
    className
}: AgendaDoDiaProps) {
    const [showAll, setShowAll] = useState(false)
    
    // Filtrar apenas as consultas de hoje
    const todayAppointments = appointments.filter(app => {
        const appDate = parseISO(app.date)
        return isToday(appDate)
    })
    
    // Ordenar por horário
    const sortedAppointments = [...todayAppointments].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
    
    // Pegar apenas as próximas consultas (até 24h no futuro)
    const now = new Date()
    const nextAppointments = sortedAppointments.filter(app => {
        const appDateTime = new Date(app.date)
        const next24Hours = new Date(now)
        next24Hours.setDate(next24Hours.getDate() + 1)
        
        return isAfter(appDateTime, now) && isBefore(appDateTime, next24Hours)
    })

    // Identificar se alguma consulta está "AGORA"
    const nowAppointment = sortedAppointments.find(app => {
        const appDate = new Date(app.date)
        const appEnd = addMinutes(appDate, app.duration || 30)
        return isAfter(new Date(), appDate) && isBefore(new Date(), appEnd)
    })

    // Obter cor com base no status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "agendada": 
                return "border-l-blue-500 bg-blue-500/5"
            case "confirmada": 
                return "border-l-green-500 bg-green-500/5"
            case "realizada": 
                return "border-l-purple-500 bg-purple-500/5"
            case "cancelada": 
                return "border-l-destructive bg-destructive/5"
            case "faltou": 
                return "border-l-amber-500 bg-amber-500/5"
            default: 
                return "border-l-gray-500 bg-gray-500/5"
        }
    }

    // Obter ícone com base no tipo
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "online":
                return <Video className="h-4 w-4" />;
            case "primeira_vez":
            case "retorno":
            case "em_grupo":
                return <Users className="h-4 w-4" />;
            case "antropometria":
                return <HeartPulse className="h-4 w-4" />;
            default:
                return <MapPin className="h-4 w-4" />;
        }
    }

    const displayedAppointments = showAll ? sortedAppointments : nextAppointments.slice(0, 3)

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Agenda do Dia
                        {nowAppointment && (
                            <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                                AGORA
                            </Badge>
                        )}
                    </CardTitle>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onAddAppointment?.(new Date())}
                        className="gap-1"
                    >
                        <Users className="h-4 w-4" />
                        Nova
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayedAppointments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Clock className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                        <p>Nenhuma consulta agendada para hoje</p>
                        <p className="text-sm mt-1">Adicione uma nova consulta</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedAppointments.map((app, index) => (
                            <div 
                                key={app.id}
                                className={cn(
                                    "border-l-4 p-4 rounded-r-lg transition-all",
                                    getStatusColor(app.status),
                                    (nowAppointment && nowAppointment.id === app.id) ? "ring-2 ring-primary/30 bg-primary/5" : ""
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium truncate">{app.patientName}</h3>
                                            {getTypeIcon(app.type)}
                                            {nowAppointment && nowAppointment.id === app.id && (
                                                <Badge variant="secondary" className="bg-destructive/20 text-destructive text-xs">
                                                    AGORA
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {format(parseISO(app.date), "HH:mm", { locale: ptBR })}
                                                {app.duration && <span>({app.duration} min)</span>}
                                            </div>
                                            
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {app.status}
                                            </Badge>
                                        </div>
                                        
                                        {app.notes && (
                                            <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                                                {app.notes}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col gap-1 ml-2">
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewAppointment?.(app.id)}
                                                title="Visualizar"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEditAppointment?.(app.id)}
                                                title="Editar"
                                            >
                                                <User className="h-4 w-4" />
                                            </Button>
                                            <PatientScheduleLink
                                                patientId={app.patientId}
                                                patientName={app.patientName}
                                            />
                                        </div>
                                        <div className="w-52">
                                            <GoogleCalendarSync appointment={app} />
                                        </div>
                                    </div>
                                </div>
                                
                                {app.meetingLink && app.type === "online" && (
                                    <div className="mt-2 text-sm">
                                        <a
                                            href={app.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            <Video className="h-3.5 w-3.5" />
                                            Entrar na reunião
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {!showAll && sortedAppointments.length > 3 && (
                    <div className="text-center pt-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowAll(true)}
                            className="w-full justify-center gap-1"
                        >
                            Ver todas as {sortedAppointments.length} consultas
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                
                {showAll && sortedAppointments.length > 3 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAll(false)}
                        className="w-full justify-center"
                    >
                        Ver menos
                    </Button>
                )}
                
                {/* Ações rápidas */}
                <div className="flex items-center gap-2 pt-4 border-t mt-4">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 gap-2"
                        onClick={() => onAddAppointment?.(new Date())}
                    >
                        <Phone className="h-4 w-4" />
                        Ligar
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 gap-2"
                        onClick={() => onAddAppointment?.(new Date())}
                    >
                        <MessageSquare className="h-4 w-4" />
                        Mensagem
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => onAddAppointment?.(new Date())}
                    >
                        Ver Agenda
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
                <div className="flex items-center justify-between">
                    <div className="h-6 w-36 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border-l-4 border-l-primary/30 rounded-r-lg bg-primary/5">
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}