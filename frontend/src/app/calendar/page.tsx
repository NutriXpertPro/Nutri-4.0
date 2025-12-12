"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout"
import { CalendarViewElegant } from "@/components/appointments/CalendarViewElegant"
import { CreateAppointmentModal } from "@/components/appointments/CreateAppointmentModal"
import { AgendaDoDia } from "@/components/appointments/AgendaDoDia"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Plus,
    Clock,
    Users,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Video
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Patient {
    id: number
    name: string
    email: string
}

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
}

export default function CalendarPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [patients] = useState<Patient[]>([
        { id: 1, name: "Maria Silva", email: "maria@example.com" },
        { id: 2, name: "João Santos", email: "joao@example.com" },
        { id: 3, name: "Ana Costa", email: "ana@example.com" },
        { id: 4, name: "Carlos Oliveira", email: "carlos@example.com" },
        { id: 5, name: "Fernanda Lima", email: "fernanda@example.com" },
    ])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    // Simular carregamento de dados
    useEffect(() => {
        // Em uma implementação real, isso viria de uma API
        const mockAppointments: Appointment[] = [
            {
                id: 1,
                patientName: "Maria Silva",
                patientEmail: "maria@example.com",
                date: new Date(2025, 11, 12, 9, 0).toISOString(),
                duration: 60,
                type: "presencial",
                status: "confirmada",
                notes: "Avaliação inicial"
            },
            {
                id: 2,
                patientName: "João Santos",
                patientEmail: "joao@example.com",
                date: new Date(2025, 11, 12, 10, 30).toISOString(),
                duration: 45,
                type: "online",
                status: "agendada",
                meetingLink: "https://meet.google.com/xxx-xxxx",
                notes: "Retorno online"
            },
            {
                id: 3,
                patientName: "Ana Costa",
                patientEmail: "ana@example.com",
                date: new Date(2025, 11, 15, 14, 0).toISOString(),
                duration: 60,
                type: "presencial",
                status: "agendada",
                notes: "Consulta de rotina"
            },
            {
                id: 4,
                patientName: "Carlos Oliveira",
                patientEmail: "carlos@example.com",
                date: new Date(2025, 11, 10, 16, 0).toISOString(),
                duration: 30,
                type: "online",
                status: "realizada",
                meetingLink: "https://meet.google.com/yyy-yyyy",
                notes: "Ajuste de dieta"
            }
        ]
        setAppointments(mockAppointments)
    }, [])

    const handleCreateAppointment = (data: any) => {
        // Em uma implementação real, isso chamaria uma API
        const newAppointment: Appointment = {
            id: appointments.length + 1,
            patientName: patients.find(p => p.id === data.patientId)?.name || "Paciente",
            patientEmail: patients.find(p => p.id === data.patientId)?.email || "",
            date: new Date(data.date).toISOString(),
            duration: data.duration,
            type: data.type,
            status: "agendada",
            meetingLink: data.meetingLink,
            notes: data.notes
        }
        
        setAppointments([...appointments, newAppointment])
        setShowCreateModal(false)
    }

    const handleDateClick = (date: Date) => {
        setSelectedDate(date)
        setShowCreateModal(true)
    }

    return (
        <DashboardLayout>
            {/* Background Decorativo */}
            <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />

            <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Premium */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/20 ring-4 ring-primary/5">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                Agenda de Consultas
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Gerencie suas consultas e horários
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button 
                            onClick={() => setShowCreateModal(true)} 
                            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            Nova Consulta
                        </Button>
                    </div>
                </div>

                {/* Stats Cards Premium */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="h-7 w-7 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'agendada').length}</p>
                                <p className="text-sm text-muted-foreground">Agendadas</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-7 w-7 text-green-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'confirmada').length}</p>
                                <p className="text-sm text-muted-foreground">Confirmadas</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-7 w-7 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => new Date(a.date) > new Date()).length}</p>
                                <p className="text-sm text-muted-foreground">Hoje</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-7 w-7 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'faltou' || a.status === 'cancelada').length}</p>
                                <p className="text-sm text-muted-foreground">Pendentes</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Agenda do Dia e Calendário */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CalendarViewElegant 
                            appointments={appointments}
                            onDateSelect={handleDateClick}
                            onAppointmentSelect={(app) => console.log('Appointment selected:', app)}
                            onAddAppointment={handleDateClick}
                        />
                    </div>
                    <div>
                        <AgendaDoDia 
                            appointments={appointments}
                            onAddAppointment={handleDateClick}
                            onEditAppointment={(id) => console.log('Edit appointment:', id)}
                            onDeleteAppointment={(id) => console.log('Delete appointment:', id)}
                            onViewAppointment={(id) => console.log('View appointment:', id)}
                            onStatusChange={(id, status) => console.log('Change status:', id, status)}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de criação de consulta */}
            <CreateAppointmentModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                patients={patients}
                onSubmit={handleCreateAppointment}
                defaultDate={selectedDate || undefined}
            />
        </DashboardLayout>
    )
}