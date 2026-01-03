"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Video,
    MapPin,
    Users,
    Sun,
    Moon,
    Coffee,
    Dumbbell,
    HeartPulse,
    Target,
    Edit3,
    Trash2,
    Eye,
    Check,
    X,
    AlertCircle,
    GripVertical,
    Link as LinkIcon
} from "lucide-react"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addMonths,
    subMonths,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { PatientScheduleLink } from "./PatientScheduleLink"
import { GoogleCalendarSync } from "./GoogleCalendarSync"
import GoogleCalendarIntegration from "@/components/integrations/GoogleCalendarIntegration"
import { IconWrapper } from "@/components/ui/IconWrapper"

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
    objective?: string
}

interface CalendarViewProps {
    appointments: Appointment[]
    onDateSelect?: (date: Date) => void
    onAppointmentSelect?: (appointment: Appointment) => void
    onAddAppointment?: (date: Date) => void
    onEditAppointment?: (id: number) => void
    onMoveAppointment?: (id: number, newDate: Date) => void  // Nova função para mover compromisso
    onDeleteAppointment?: (id: number) => void
    onStatusChange?: (id: number, newStatus: string) => void
    selectedDate?: Date  // Data selecionada
}

export function CalendarViewElegant({
    appointments,
    onDateSelect,
    onAppointmentSelect,
    onAddAppointment,
    onEditAppointment,
    onMoveAppointment,
    onDeleteAppointment,
    onStatusChange,
    selectedDate
}: CalendarViewProps) {
    // Função para obter o status mais importante para destaque
    const getPriorityStatus = (status: string) => {
        switch (status) {
            case "realizada":
                return 1; // Menor prioridade
            case "agendada":
                return 2;
            case "confirmada":
                return 3;
            case "faltou":
                return 4;
            case "cancelada":
                return 5; // Maior prioridade
            default:
                return 0;
        }
    };
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<"month" | "week" | "day">("month")
    const [hoveredDay, setHoveredDay] = useState<Date | null>(null)
    const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null)
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null)
    const isDraggingRef = useRef(false) // Ref para controlar se está arrastando, evitando conflito com click

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const goToToday = () => setCurrentDate(new Date())

    // Pegar agendamentos para uma data específica
    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter(app => {
            // Parse the appointment date and compare with the target date
            const appDate = parseISO(app.date)
            return isSameDay(appDate, date)
        })
    }

    // Pegar ícone com base no tipo
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "online":
                return <Video className="h-3 w-3" />;
            case "primeira_vez":
            case "retorno":
            case "em_grupo":
                return <Users className="h-3 w-3" />;
            case "antropometria":
                return <HeartPulse className="h-3 w-3" />;
            default:
                return <MapPin className="h-3 w-3" />;
        }
    }

    // Pegar cor com base no status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "agendada":
                return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300"
            case "confirmada":
                return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300"
            case "realizada":
                return "bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300"
            case "cancelada":
                return "bg-gradient-to-r from-destructive/20 to-rose-500/20 border-destructive/30 text-destructive dark:text-destructive-foreground"
            case "faltou":
                return "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300"
            default:
                return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-700 dark:text-gray-300"
        }
    }

    // Renderizar a vista mensal
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const dateFormat = "d"
        const rows = []

        let days = []
        let day = startDate
        let formattedDate = ""

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat)
                const cloneDay = new Date(day)
                const dayAppointments = getAppointmentsForDate(cloneDay)

                days.push(
                    <div
                        key={day.toString()}
                        className={`
                            min-h-28 p-2 rounded-xl border transition-all duration-300
                            ${!isSameMonth(day, monthStart) ? "bg-muted/20 text-muted-foreground/70" : "bg-card"}
                            ${isSameDay(day, selectedDate || new Date()) ? "ring-2 ring-primary/50 bg-primary/5 border-primary" : "border-border"}
                            hover:shadow-md hover:border-primary/30
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`
                                flex h-7 w-7 items-center justify-center rounded-full text-sm
                                ${isSameDay(day, selectedDate || new Date())
                                    ? "bg-primary text-primary-foreground"
                                    : dayAppointments.length > 0
                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
                                        : "text-muted-foreground"}
                            `}>
                                {formattedDate}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                onClick={() => onAddAppointment?.(cloneDay)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                        <div
                            className="mt-1 space-y-1 max-h-20 overflow-y-auto relative"
                            onClick={() => onDateSelect?.(cloneDay)}
                            onMouseEnter={() => {
                                if (hoverTimeout.current) {
                                    clearTimeout(hoverTimeout.current);
                                }
                                setHoveredDay(cloneDay);
                            }}
                            onMouseLeave={() => {
                                // Definir timeout para remover o hover após 300ms
                                hoverTimeout.current = setTimeout(() => {
                                    setHoveredDay(null);
                                }, 300);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Garante que o evento não suba e seja cancelado
                                // Adiciona feedback visual forte
                                e.currentTarget.classList.add('bg-primary/10', 'border-primary', 'border-dashed');
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Remove o feedback visual
                                e.currentTarget.classList.remove('bg-primary/10', 'border-primary', 'border-dashed');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Importante para garantir que o drop seja processado aqui
                                e.currentTarget.classList.remove('bg-primary/10', 'border-primary', 'border-dashed');

                                console.log('EVENTO DROP DETECTADO!'); // Log para debug no console do navegador

                                // Tentar usar o estado primeiro, depois fallback para o dataTransfer
                                let appointmentId;
                                let newDate = new Date(cloneDay); // Copia a data do dia alvo (que vem zerada, ex: 00:00)

                                if (draggedAppointment) {
                                    appointmentId = draggedAppointment.id;
                                    console.log('Drop usando estado, ID:', appointmentId);

                                    // PRESERVAR O HORÁRIO ORIGINAL:
                                    // Pegamos a hora original do agendamento arrastado
                                    const originalDate = parseISO(draggedAppointment.date);
                                    // Aplicamos ao novo dia
                                    newDate.setHours(originalDate.getHours());
                                    newDate.setMinutes(originalDate.getMinutes());
                                    newDate.setSeconds(0);
                                    newDate.setMilliseconds(0);

                                } else {
                                    appointmentId = parseInt(e.dataTransfer.getData('text/plain'));
                                    console.log('Drop usando dataTransfer, ID:', appointmentId);
                                    // Se vier via dataTransfer puro (sem estado React), tentamos parsear o JSON auxiliar se existir
                                    try {
                                        const appData = JSON.parse(e.dataTransfer.getData('appointment-data'));
                                        if (appData && appData.date) {
                                            const originalDate = parseISO(appData.date);
                                            newDate.setHours(originalDate.getHours());
                                            newDate.setMinutes(originalDate.getMinutes());
                                        }
                                    } catch (err) {
                                        console.warn('Não foi possível recuperar horário original via dataTransfer');
                                    }
                                }

                                // Chamar a função para mover o compromisso para a nova data com horário preservado
                                if (onMoveAppointment) {
                                    console.log('Chamando onMoveAppointment com ID:', appointmentId, 'Para:', newDate);
                                    onMoveAppointment(appointmentId, newDate);
                                    // Limpar o estado após mover
                                    setDraggedAppointment(null);
                                } else {
                                    // Fallback para a função de edição se onMoveAppointment não estiver disponível
                                    console.log('onMoveAppointment não está disponível, tentando onEditAppointment');
                                    if (onEditAppointment) {
                                        onEditAppointment(appointmentId);
                                    }
                                }
                            }}
                        >
                            {dayAppointments.slice(0, 3).map((app, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                        text-xs p-2 rounded-lg truncate transition-all
                                        ${getStatusColor(app.status)}
                                        border cursor-grab active:cursor-grabbing hover:opacity-80
                                    `}
                                    draggable={true}
                                    onDragStart={(e) => {
                                        console.log('>>> DRAG START INICIADO PARA:', app.patientName);
                                        isDraggingRef.current = true; // Marca inicio do drag
                                        e.dataTransfer.setData('text/plain', app.id.toString());
                                        e.dataTransfer.setData('appointment-data', JSON.stringify(app));
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDraggedAppointment(app);
                                        // Feedback visual imediato
                                        e.currentTarget.style.opacity = '0.5';
                                    }}
                                    onDragEnd={(e) => {
                                        console.log('>>> DRAG END FINALIZADO');
                                        // Pequeno delay para garantir que o click não dispare logo após o drop
                                        setTimeout(() => {
                                            isDraggingRef.current = false;
                                        }, 100);
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.classList.remove('opacity-50', 'bg-primary/20');
                                        setDraggedAppointment(null);
                                    }}
                                    onClick={(e) => {
                                        if (isDraggingRef.current) {
                                            console.log('Click ignorado pois estava arrastando');
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return;
                                        }
                                        onAppointmentSelect?.(app);
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <GripVertical className="h-2.5 w-2.5 text-muted-foreground cursor-grab" />
                                            <div className="truncate">{app.patientName}</div>
                                            {getTypeIcon(app.type)}
                                        </div>
                                        <div className="flex gap-1 ml-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 p-0.5 text-current"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditAppointment?.(app.id);
                                                }}
                                            >
                                                <Edit3 className="h-2.5 w-2.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 p-0.5 text-current"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteAppointment?.(app.id);
                                                }}
                                            >
                                                <Trash2 className="h-2.5 w-2.5" />
                                            </Button>
                                        </div>
                                    </div>
                                    {onStatusChange && (
                                        <div className="flex gap-1 mt-1">
                                            <Button
                                                variant={app.status === "agendada" ? "default" : "outline"}
                                                size="icon"
                                                className="h-3.5 text-[0.6rem] px-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStatusChange?.(app.id, "agendada");
                                                }}
                                            >
                                                A
                                            </Button>
                                            <Button
                                                variant={app.status === "confirmada" ? "default" : "outline"}
                                                size="icon"
                                                className="h-3.5 text-[0.6rem] px-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStatusChange?.(app.id, "confirmada");
                                                }}
                                            >
                                                C
                                            </Button>
                                            <Button
                                                variant={app.status === "realizada" ? "default" : "outline"}
                                                size="icon"
                                                className="h-3.5 text-[0.6rem] px-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onStatusChange?.(app.id, "realizada");
                                                }}
                                            >
                                                R
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Clock className="h-2.5 w-2.5" />
                                        {format(parseISO(app.date), "HH:mm")}
                                    </div>
                                </div>
                            ))}
                            {dayAppointments.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center pt-1">
                                    +{dayAppointments.length - 3} mais
                                </div>
                            )}
                        </div>

                        {/* Visualização detalhada ao passar o mouse */}
                        {hoveredDay && isSameDay(day, hoveredDay) && dayAppointments.length > 0 && (
                            <div
                                className="absolute z-50 mt-2 p-4 bg-background border rounded-lg shadow-lg min-w-64 max-w-xs"
                                onMouseEnter={() => {
                                    // Cancelar qualquer timeout que esteja em andamento
                                    if (hoverTimeout.current) {
                                        clearTimeout(hoverTimeout.current);
                                    }
                                    setHoveredDay(cloneDay);
                                }}
                                onMouseLeave={() => {
                                    setHoveredDay(null);
                                }}
                            >
                                <h4 className="mb-2">Consultas em {format(cloneDay, "dd/MM/yyyy", { locale: ptBR })}</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {dayAppointments.map((app) => (
                                        <div key={app.id} className="border-l-4 p-3 rounded-r bg-muted border-l-primary">
                                            <div className="flex justify-between">
                                                <span>{app.patientName}</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-sm">
                                                <Clock className="h-3 w-3" />
                                                {format(parseISO(app.date), "HH:mm")}
                                                <span className="mx-1">•</span>
                                                {getTypeIcon(app.type)}
                                                <span className="capitalize">{app.type}</span>
                                            </div>
                                            {app.notes && (
                                                <p className="text-xs mt-1 text-muted-foreground truncate">
                                                    {app.notes}
                                                </p>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAppointmentSelect?.(app);
                                                    }}
                                                >
                                                    Ver
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditAppointment?.(app.id);
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                            </div>
                                            <div className="pt-2 border-t border-border/30 mt-2">
                                                <PatientScheduleLink
                                                    patientId={app.patientId}
                                                    patientName={app.patientName}
                                                />
                                            </div>

                                            <div className="pt-2 mt-2">
                                                <GoogleCalendarSync appointment={app} />
                                            </div>

                                            {/* Controles de status */}
                                            {onStatusChange && (
                                                <div className="flex gap-1 mt-2">
                                                    <Button
                                                        variant={app.status === "agendada" ? "default" : "outline"}
                                                        size="sm"
                                                        className="h-6 text-xs flex-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onStatusChange?.(app.id, "agendada");
                                                        }}
                                                    >
                                                        Agend.
                                                    </Button>
                                                    <Button
                                                        variant={app.status === "confirmada" ? "default" : "outline"}
                                                        size="sm"
                                                        className="h-6 text-xs flex-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onStatusChange?.(app.id, "confirmada");
                                                        }}
                                                    >
                                                        Confirm.
                                                    </Button>
                                                    <Button
                                                        variant={app.status === "realizada" ? "default" : "outline"}
                                                        size="sm"
                                                        className="h-6 text-xs flex-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onStatusChange?.(app.id, "realizada");
                                                        }}
                                                    >
                                                        Realiz.
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )
                day = addDays(day, 1)
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7 gap-3">
                    {days}
                </div>
            )
            days = []
        }

        return <div className="space-y-3">{rows}</div>
    }

    // Renderizar a vista semanal
    const renderWeekView = () => {
        // Para simplificação, vamos retornar uma mensagem indicando que está em desenvolvimento
        // A implementação completa exigiria mais detalhes visuais
        return (
            <div className="text-center py-12 text-muted-foreground">
                <div className="flex justify-center mb-4">
                    <Clock className="h-12 w-12" />
                </div>
                <p className="text-lg">Visualização semanal em breve</p>
                <p className="text-sm">Aprimorando a experiência de visualização</p>
            </div>
        )
    }

    // Renderizar a vista diária
    const renderDayView = () => {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <div className="flex justify-center mb-4">
                    <Sun className="h-12 w-12" />
                </div>
                <p className="text-lg">Visualização diária em breve</p>
                <p className="text-sm">Aprimorando a experiência de visualização</p>
            </div>
        )
    }

    return (
        <Card className="overflow-hidden bg-gradient-to-br from-card to-card/70 backdrop-blur-xl border-border/50 shadow-xl shadow-primary/5 relative">
            <CardHeader className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <IconWrapper
                            icon={CalendarIcon}
                            variant="amber"
                            size="xl"
                            className="ring-4 ring-background border border-white/10 dark:border-white/20 shadow-md"
                        />
                        <div>
                            <h2 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Agenda de Consultas
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Gerencie suas consultas e horários
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToToday}
                            className="px-4"
                        >
                            Hoje
                        </Button>
                        <Button variant="outline" size="sm" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />
                        <div className="flex gap-1">
                            <Button
                                variant={view === "month" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setView("month")}
                                className="px-3"
                            >
                                Mês
                            </Button>
                            <Button
                                variant={view === "week" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setView("week")}
                                className="px-3"
                            >
                                Sem
                            </Button>
                            <Button
                                variant={view === "day" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setView("day")}
                                className="px-3"
                            >
                                Dia
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-2">
                    <div className="w-64">
                        <GoogleCalendarIntegration />
                    </div>
                </div>
                <div className="text-center mt-2">
                    <h3 className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                        {format(currentDate, "LLLL yyyy", { locale: ptBR })}
                    </h3>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
                <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-3 text-center text-sm text-muted-foreground">
                        <div className="flex items-center justify-center">Dom</div>
                        <div className="flex items-center justify-center">Seg</div>
                        <div className="flex items-center justify-center">Ter</div>
                        <div className="flex items-center justify-center">Qua</div>
                        <div className="flex items-center justify-center">Qui</div>
                        <div className="flex items-center justify-center">Sex</div>
                        <div className="flex items-center justify-center">Sáb</div>
                    </div>
                    {view === "month" && renderMonthView()}
                    {view === "week" && renderWeekView()}
                    {view === "day" && renderDayView()}
                </div>
            </CardContent>
        </Card>
    )
}