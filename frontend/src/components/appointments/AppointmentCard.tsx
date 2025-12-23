"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    MapPin,
    Video,
    Edit3,
    Trash2,
    Eye,
    Phone,
    MessageSquare,
    Check,
    X,
    Users,
    HeartPulse
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface AppointmentCardProps {
    appointment: {
        id: number
        patientName: string
        patientEmail: string
        date: string
        duration: number
        type: "presencial" | "online" | "primeira_vez" | "retorno" | "em_grupo" | "pacote" | "permuta" | "pessoal" | "antropometria" | "amigo" | "encaixe" | "teste"
        status: "agendada" | "confirmada" | "realizada" | "cancelada" | "faltou"
        meetingLink?: string
        notes?: string
    }
    onEdit?: (id: number) => void
    onDelete?: (id: number) => void
    onView?: (id: number) => void
    onStatusChange?: (id: number, newStatus: string) => void
}

export function AppointmentCard({
    appointment,
    onEdit,
    onDelete,
    onView,
    onStatusChange
}: AppointmentCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "agendada":
                return "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300"
            case "confirmada":
                return "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300"
            case "realizada":
                return "border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-300"
            case "cancelada":
                return "border-destructive/50 bg-destructive/10 text-destructive dark:text-destructive-foreground"
            case "faltou":
                return "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            default:
                return "border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-300"
        }
    }

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

    const formatDate = (dateString: string) => {
        const date = parseISO(dateString)
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    }

    return (
        <Card className={cn("overflow-hidden border-l-4", getStatusColor(appointment.status))}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base line-clamp-1">{appointment.patientName}</CardTitle>
                    <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(appointment.status).split(' ')[0])}>
                        {appointment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(appointment.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getTypeIcon(appointment.type)}
                    <span className="capitalize">{appointment.type}</span>
                    {appointment.duration && <span>({appointment.duration} min)</span>}
                </div>

                {appointment.notes && (
                    <div className="text-sm p-2 bg-muted/30 rounded text-muted-foreground line-clamp-2">
                        {appointment.notes}
                    </div>
                )}

                {appointment.meetingLink && appointment.type === "online" && (
                    <div className="text-sm p-2 bg-blue-500/10 rounded text-blue-600 dark:text-blue-300">
                        <a
                            href={appointment.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                        >
                            Link da reunião
                        </a>
                    </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView?.(appointment.id)}
                        title="Visualizar"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(appointment.id)}
                        title="Editar"
                    >
                        <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete?.(appointment.id)}
                        title="Excluir"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 min-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                            {appointment.status === 'agendada' && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onStatusChange?.(appointment.id, 'confirmada')}
                                        title="Confirmar"
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onStatusChange?.(appointment.id, 'cancelada')}
                                        title="Cancelar"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </>
                            )}
                            {appointment.status === 'confirmada' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onStatusChange?.(appointment.id, 'realizada')}
                                    title="Realizada"
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}