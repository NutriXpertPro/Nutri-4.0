"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout"
import { CalendarViewElegant } from "@/components/appointments/CalendarViewElegant"
import { CreateAppointmentModal } from "@/components/appointments/CreateAppointmentModal"
import { AgendaDoDia } from "@/components/appointments/AgendaDoDia"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/services/api"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Calendar,
    Plus,
    Clock,
    Users,
    CheckCircle2,
    AlertCircle,
    MapPin,
    Video,
    HeartPulse,
    Bell,
    Search
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AppointmentRequestNotification } from "@/components/appointments/AppointmentRequestNotification"
import { GoogleCalendarSync } from "@/components/appointments/GoogleCalendarSync"

interface Patient {
    id: number
    name: string
    email: string
}

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
    const [pendingRequests, setPendingRequests] = useState([
        { id: 1, patientName: "José Silva", date: new Date(2025, 11, 14, 10, 0).toISOString(), time: "10:00", reason: "Primeira consulta" },
        { id: 2, patientName: "Mariana Costa", date: new Date(2025, 11, 16, 14, 30).toISOString(), time: "14:30", reason: "Retorno" }
    ])
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterType, setFilterType] = useState<string>('all')
    const [filterSearch, setFilterSearch] = useState<string>('')

    // Simular carregamento de dados
    useEffect(() => {
        // Em uma implementação real, isso viria de uma API
        const mockAppointments: Appointment[] = [
            {
                id: 1,
                patientId: 1,
                patientName: "Maria Silva",
                patientEmail: "maria@example.com",
                date: new Date(2025, 11, 12, 9, 0).toISOString(),
                duration: 60,
                type: "primeira_vez",
                status: "confirmada",
                notes: "Avaliação inicial"
            },
            {
                id: 2,
                patientId: 2,
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
                patientId: 3,
                patientName: "Ana Costa",
                patientEmail: "ana@example.com",
                date: new Date(2025, 11, 15, 14, 0).toISOString(),
                duration: 60,
                type: "retorno",
                status: "agendada",
                notes: "Consulta de rotina"
            },
            {
                id: 4,
                patientId: 4,
                patientName: "Carlos Oliveira",
                patientEmail: "carlos@example.com",
                date: new Date(2025, 11, 10, 16, 0).toISOString(),
                duration: 30,
                type: "em_grupo",
                status: "realizada",
                notes: "Ajuste de dieta"
            },
            {
                id: 5,
                patientId: 5,
                patientName: "Fernanda Lima",
                patientEmail: "fernanda@example.com",
                date: new Date(2025, 11, 14, 11, 0).toISOString(),
                duration: 45,
                type: "antropometria",
                status: "agendada",
                notes: "Medição antropométrica"
            }
        ]
        setAppointments(mockAppointments)
    }, [])

    // Filtrar compromissos com base nos filtros aplicados
    const filteredAppointments = appointments.filter(app => {
        // Filtrar por status
        if (filterStatus !== 'all' && app.status !== filterStatus) {
            return false
        }

        // Filtrar por tipo
        if (filterType !== 'all' && app.type !== filterType) {
            return false
        }

        // Filtrar por busca
        if (filterSearch && !app.patientName.toLowerCase().includes(filterSearch.toLowerCase())) {
            return false
        }

        return true
    })

    const handleCreateAppointment = (data: any) => {
        // Em uma implementação real, isso chamaria uma API
        const newAppointment: Appointment = {
            id: appointments.length + 1,
            patientId: data.patientId,
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

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setShowCreateModal(true)
    }

    const handleAppointmentSelect = (appointment: Appointment) => {
        // Para implementação futura de visualização de detalhes
        setSelectedDate(new Date(appointment.date));
        console.log('Appointment selected:', appointment);
    }

    const handleEditAppointment = (id: number) => {
        const appointment = appointments.find(app => app.id === id);
        if (appointment) {
            // Se selectedDate estiver definido, usamos essa data (para casos de drag and drop)
            const dateToUse = selectedDate || new Date(appointment.date);
            setSelectedDate(dateToUse);

            // Converter a data para o formato necessário para o modal
            const appointmentForEdit = {
                id: appointment.id,
                patientId: patients.find(p => p.name === appointment.patientName)?.id,
                patientName: appointment.patientName,
                date: dateToUse.toISOString(), // Usa a nova data se estiver definida
                time: format(dateToUse, 'HH:mm'),
                duration: appointment.duration,
                type: appointment.type,
                meetingLink: appointment.meetingLink,
                notes: appointment.notes
            };

            setFormDataForEdit(appointmentForEdit);
            setShowCreateModal(true);
        }
    }

    // Definindo o tipo AppointmentForEdit
    interface AppointmentForEdit {
        id: number
        patientId?: number
        patientName?: string
        date: string
        time: string
        duration: number
        type: "presencial" | "online" | "primeira_vez" | "retorno" | "em_grupo" | "pacote" | "permuta" | "pessoal" | "antropometria" | "amigo" | "encaixe" | "teste"
        meetingLink?: string
        notes?: string
    }

    // Estado para armazenar dados da consulta a ser editada
    const [formDataForEdit, setFormDataForEdit] = useState<AppointmentForEdit | null>(null);

    // Função para atualizar uma consulta existente
    const handleUpdateAppointment = async (id: number, data: any) => {
        try {
            // Atualizar no backend
            const response = await api.put(`/appointments/${id}/`, {
                ...data,
                date: data.date, // Garantir que a nova data seja usada
                patient: data.patientId
            });

            // Atualizar na lista local
            const updatedAppointments = appointments.map(app => {
                if (app.id === id) {
                    return {
                        ...app,
                        patientId: data.patientId,
                        patientName: patients.find(p => p.id === data.patientId)?.name || app.patientName,
                        patientEmail: patients.find(p => p.id === data.patientId)?.email || app.patientEmail,
                        date: data.date || app.date, // Usa a nova data se estiver definida
                        duration: data.duration,
                        type: data.type,
                        meetingLink: data.meetingLink,
                        notes: data.notes
                    };
                }
                return app;
            });

            setAppointments(updatedAppointments);
            setShowCreateModal(false);
            setFormDataForEdit(null);
            setSelectedDate(null); // Resetar a data selecionada após atualização
            toast.success("Consulta atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar consulta:", error);
            toast.error("Erro ao atualizar consulta. Por favor, tente novamente.");
        }
    }

    const handleMoveAppointment = async (id: number, newDate: Date) => {
        console.log('handleMoveAppointment chamado com ID:', id, 'e nova data:', newDate);
        try {
            // Encontrar o compromisso a ser movido
            const appointment = appointments.find(app => app.id === id);
            if (!appointment) {
                console.log('Compromisso não encontrado para ID:', id);
                toast.error("Compromisso não encontrado");
                return;
            }

            console.log('Atualizando compromisso no backend com data:', newDate.toISOString());

            // Criar objeto com apenas o campo de data para atualização
            const updateData = {
                date: newDate.toISOString(),  // O formato ISO é o esperado pelo Django
            };

            // Atualizar no backend
            const response = await api.patch(`/appointments/${id}/`, updateData);
            console.log('Backend respondeu:', response);

            // Atualizar na lista local
            const updatedAppointments = appointments.map(app =>
                app.id === id
                    ? { ...app, date: newDate.toISOString() }
                    : app
            );

            setAppointments(updatedAppointments);
            console.log('Compromisso atualizado localmente');
            toast.success("Consulta movida com sucesso!");
        } catch (error: any) {
            console.error("Erro ao mover consulta:", error);
            console.error("Detalhes do erro:", error.response?.data);
            
            let errorMessage = "Erro ao mover consulta. Por favor, tente novamente.";
            
            if (error.response?.data) {
                // Tenta extrair mensagem de erro de campos comuns do Django/DRF
                if (error.response.data.error) errorMessage = error.response.data.error;
                else if (error.response.data.detail) errorMessage = error.response.data.detail;
                else if (error.response.data.non_field_errors) errorMessage = error.response.data.non_field_errors[0];
                else if (Array.isArray(error.response.data)) errorMessage = error.response.data[0];
                // Se for um erro de validação de campo específico (ex: { date: ["Data inválida"] })
                else {
                    const firstKey = Object.keys(error.response.data)[0];
                    if (firstKey) {
                        const errorContent = error.response.data[firstKey];
                        errorMessage = `${firstKey}: ${Array.isArray(errorContent) ? errorContent[0] : errorContent}`;
                    }
                }
            }
            
            toast.error(errorMessage);
        }
    };

    const handleDeleteAppointment = (id: number) => {
        if (confirm('Tem certeza que deseja excluir esta consulta?')) {
            setAppointments(appointments.filter(app => app.id !== id));
        }
    }

    const getTypeLabel = (type: string): string => {
        const typeLabels: Record<string, string> = {
            'presencial': 'Presencial',
            'online': 'Online',
            'primeira_vez': 'Primeira Vez',
            'retorno': 'Retorno',
            'em_grupo': 'Em Grupo',
            'pacote': 'Pacote',
            'permuta': 'Permuta',
            'pessoal': 'Pessoal',
            'antropometria': 'Antropometria',
            'amigo': 'Amigo',
            'encaixe': 'Encaixe',
            'teste': 'Teste',
        };
        return typeLabels[type] || type;
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        setAppointments(appointments.map(app =>
            app.id === id ? { ...app, status: newStatus as Appointment['status'] } : app
        ));
    }

    const handleApproveRequest = (id: number) => {
        // Em uma implementação real, isso atualizaria o status no backend
        const request = pendingRequests.find(r => r.id === id);
        if (request) {
            // Aqui você adicionaria a consulta à agenda
            const newAppointment: Appointment = {
                id: appointments.length + 1,
                patientId: 0, // ID real seria obtido do paciente
                patientName: request.patientName,
                patientEmail: "",
                date: request.date,
                duration: 60,
                type: "presencial", // Poderia ser definido na solicitação
                status: "confirmada", // Status confirmado após aprovação
                notes: `Solicitação aprovada em ${new Date().toLocaleString()}`
            };

            setAppointments([...appointments, newAppointment]);
            setPendingRequests(pendingRequests.filter(r => r.id !== id));
            toast.success(`Consulta aprovada para ${request.patientName}`);
        }
    }

    const handleRejectRequest = (id: number) => {
        // Em uma implementação real, isso atualizaria o status no backend
        const request = pendingRequests.find(r => r.id === id);
        setPendingRequests(pendingRequests.filter(r => r.id !== id));
        toast.info(`Solicitação de ${request?.patientName} rejeitada`);
    }

    return (
        <DashboardLayout>
            {/* Background Decorativo */}
            <div className="fixed inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5 -z-10" />

            <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Notificações de solicitações pendentes */}
                {pendingRequests.length > 0 && (
                    <AppointmentRequestNotification
                        pendingAppointments={pendingRequests.map(req => ({
                            id: req.id,
                            patientName: req.patientName,
                            date: req.date,
                            time: req.time,
                            reason: req.reason
                        }))}
                        onApprove={handleApproveRequest}
                        onReject={handleRejectRequest}
                    />
                )}

                {/* Header Premium */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/20 ring-4 ring-primary/5">
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
                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="h-7 w-7 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'agendada').length}</p>
                                <p className="text-sm text-muted-foreground">Agendadas</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-green-500/20 to-green-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="h-7 w-7 text-green-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'confirmada').length}</p>
                                <p className="text-sm text-muted-foreground">Confirmadas</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="h-7 w-7 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => new Date(a.date) > new Date()).length}</p>
                                <p className="text-sm text-muted-foreground">Hoje</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-card/80 to-card/40 backdrop-blur-xl border-border/40 hover:shadow-lg transition-all group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-7 w-7 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{appointments.filter(a => a.status === 'faltou' || a.status === 'cancelada').length}</p>
                                <p className="text-sm text-muted-foreground">Pendentes</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar paciente..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                <SelectItem value="agendada">Agendada</SelectItem>
                                <SelectItem value="confirmada">Confirmada</SelectItem>
                                <SelectItem value="realizada">Realizada</SelectItem>
                                <SelectItem value="cancelada">Cancelada</SelectItem>
                                <SelectItem value="faltou">Faltou</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os tipos</SelectItem>
                                <SelectItem value="presencial">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Presencial
                                    </div>
                                </SelectItem>
                                <SelectItem value="online">
                                    <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4" />
                                        Online
                                    </div>
                                </SelectItem>
                                <SelectItem value="primeira_vez">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Primeira Vez
                                    </div>
                                </SelectItem>
                                <SelectItem value="retorno">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Retorno
                                    </div>
                                </SelectItem>
                                <SelectItem value="em_grupo">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Em Grupo
                                    </div>
                                </SelectItem>
                                <SelectItem value="pacote">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Pacote
                                    </div>
                                </SelectItem>
                                <SelectItem value="permuta">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Permuta
                                    </div>
                                </SelectItem>
                                <SelectItem value="pessoal">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Pessoal
                                    </div>
                                </SelectItem>
                                <SelectItem value="antropometria">
                                    <div className="flex items-center gap-2">
                                        <HeartPulse className="h-4 w-4" />
                                        Antropometria
                                    </div>
                                </SelectItem>
                                <SelectItem value="amigo">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Amigo
                                    </div>
                                </SelectItem>
                                <SelectItem value="encaixe">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Encaixe
                                    </div>
                                </SelectItem>
                                <SelectItem value="teste">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Teste
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Agenda do Dia e Calendário */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <CalendarViewElegant
                            appointments={filteredAppointments}
                            onDateSelect={handleDateSelect}
                            onAppointmentSelect={handleAppointmentSelect}
                            onAddAppointment={handleDateSelect}
                            onEditAppointment={handleEditAppointment}
                            onMoveAppointment={handleMoveAppointment}
                            onDeleteAppointment={handleDeleteAppointment}
                            onStatusChange={handleStatusChange}
                            selectedDate={selectedDate || undefined}
                        />
                    </div>
                    <div>
                        <AgendaDoDia
                            appointments={filteredAppointments}
                            onAddAppointment={handleDateSelect}
                            onEditAppointment={handleEditAppointment}
                            onDeleteAppointment={handleDeleteAppointment}
                            onViewAppointment={handleAppointmentSelect}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de criação/edição de consulta */}
            <CreateAppointmentModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                patients={patients}
                onSubmit={handleCreateAppointment}
                onEdit={handleUpdateAppointment}
                appointmentToEdit={formDataForEdit}
                defaultDate={selectedDate || undefined}
            />
        </DashboardLayout>
    )
}