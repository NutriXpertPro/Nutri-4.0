"use client"

import { useState, useMemo } from "react"
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
    AlertCircle
} from "lucide-react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, isSameDay, addDays, parseISO, isToday, getHours, getMinutes, isBefore, isAfter, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface Appointment {
    id: number
    patientName: string
    patientEmail: string
    date: string
    duration: number
    type: "presencial" | "online"
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
    onEditAppointment?: (appointment: Appointment) => void
    onDeleteAppointment?: (appointment: Appointment) => void
}

export function CalendarViewElegant({ 
    appointments, 
    onDateSelect, 
    onAppointmentSelect,
    onAddAppointment,
    onEditAppointment,
    onDeleteAppointment
}: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<"month" | "week" | "day">("month")

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const goToToday = () => setCurrentDate(new Date())

    // Pegar agendamentos para uma data específica
    const getAppointmentsForDate = (date: Date) => {
        return appointments.filter(app => {
            const appDate = parseISO(app.date)
            return isSameDay(appDate, date)
        })
    }

    // Obter cor com base no status
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

    // Obter ícone com base no tipo
    const getTypeIcon = (type: string) => {
        return type === "online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />
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
                            ${isSameDay(day, new Date()) ? "ring-2 ring-primary/50 bg-primary/5 border-primary" : "border-border"}
                            hover:shadow-md hover:border-primary/30
                        `}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`
                                flex h-7 w-7 items-center justify-center rounded-full text-sm
                                ${isSameDay(day, new Date()) 
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
                        <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                            {dayAppointments.slice(0, 3).map((app, idx) => (
                                <div 
                                    key={idx}
                                    className={`
                                        text-xs p-2 rounded-lg truncate cursor-pointer transition-all
                                        ${getStatusColor(app.status)}
                                        border
                                    `}
                                    onClick={() => onAppointmentSelect?.(app)}
                                >
                                    <div className="flex items-center gap-1">
                                        <div className="font-medium truncate">{app.patientName}</div>
                                        {getTypeIcon(app.type)}
                                    </div>
                                    <div className="flex items-center gap-1">
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
                <p className="text-lg font-medium">Visualização semanal em breve</p>
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
                <p className="text-lg font-medium">Visualização diária em breve</p>
                <p className="text-sm">Aprimorando a experiência de visualização</p>
            </div>
        )
    }

    return (
        <Card className="overflow-hidden bg-gradient-to-br from-card to-card/70 backdrop-blur-xl border-border/50 shadow-xl shadow-primary/5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
            <CardHeader className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
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
                <div className="text-center mt-2">
                    <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
                        {format(currentDate, "LLLL yyyy", { locale: ptBR })}
                    </h3>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
                <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-3 text-center text-sm font-medium text-muted-foreground">
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