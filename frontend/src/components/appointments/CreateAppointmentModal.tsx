"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Clock,
    MapPin,
    Video,
    Users,
    HeartPulse,
    Link,
    Calendar
} from "lucide-react"
import { format, setHours, setMinutes, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { IconWrapper } from "@/components/ui/IconWrapper"

interface Patient {
    id: number
    name: string
    email: string
}

interface AppointmentFormData {
    patientId: number | null
    date: Date | null
    time: string
    duration: number
    type: "presencial" | "online" | "primeira_vez" | "retorno" | "em_grupo" | "pacote" | "permuta" | "pessoal" | "antropometria" | "amigo" | "encaixe" | "teste"
    meetingLink: string
    notes: string
}

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

interface CreateAppointmentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patients: Patient[]
    onSubmit: (data: Omit<AppointmentFormData, 'time'> & { hour: number; minute: number }) => void
    onEdit?: (id: number, data: Omit<AppointmentFormData, 'time'> & { hour: number; minute: number }) => void
    defaultDate?: Date
    appointmentToEdit?: AppointmentForEdit
}

export function CreateAppointmentModal({
    open,
    onOpenChange,
    patients,
    onSubmit,
    onEdit,
    defaultDate,
    appointmentToEdit
}: CreateAppointmentModalProps) {
    // Inicializar o formulário com dados da consulta a ser editada, se existir
    const initialFormData: AppointmentFormData = appointmentToEdit ? {
        patientId: appointmentToEdit.patientId || patients.find(p => p.name === appointmentToEdit.patientName)?.id || null,
        date: appointmentToEdit.date ? new Date(appointmentToEdit.date) : defaultDate || null,
        time: appointmentToEdit.time || "09:00",
        duration: appointmentToEdit.duration || 60,
        type: appointmentToEdit.type || "presencial",
        meetingLink: appointmentToEdit.meetingLink || "",
        notes: appointmentToEdit.notes || ""
    } : {
        patientId: null,
        date: defaultDate || null,
        time: "09:00",
        duration: 60,
        type: "presencial",
        meetingLink: "",
        notes: ""
    };

    const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(appointmentToEdit?.date ? new Date(appointmentToEdit.date) : defaultDate);

    useEffect(() => {
        if (defaultDate && !appointmentToEdit) {
            setSelectedDate(defaultDate);
            setFormData(prev => ({
                ...prev,
                date: defaultDate
            }));
        } else if (appointmentToEdit) {
            // Atualizar o formulário quando appointmentToEdit mudar
            setFormData({
                patientId: appointmentToEdit.patientId || patients.find(p => p.name === appointmentToEdit.patientName)?.id || null,
                date: appointmentToEdit.date ? new Date(appointmentToEdit.date) : defaultDate || null,
                time: appointmentToEdit.time || "09:00",
                duration: appointmentToEdit.duration || 60,
                type: appointmentToEdit.type || "presencial",
                meetingLink: appointmentToEdit.meetingLink || "",
                notes: appointmentToEdit.notes || ""
            });
            setSelectedDate(appointmentToEdit.date ? new Date(appointmentToEdit.date) : defaultDate);
        }
    }, [defaultDate, appointmentToEdit, patients]);

    const handleSubmit = () => {
        if (!formData.patientId || !formData.date) return

        // Converter a string de tempo em horas e minutos
        const [hours, minutes] = formData.time.split(':').map(Number)

        // Criar uma nova data combinando a data selecionada com a hora
        const appointmentDateTime = setHours(setMinutes(formData.date, minutes), hours)

        if (appointmentToEdit && onEdit) {
            // Se estiver editando, chama a função de edição
            onEdit(appointmentToEdit.id, {
                patientId: formData.patientId,
                date: appointmentDateTime,
                hour: hours,
                minute: minutes,
                duration: formData.duration,
                type: formData.type,
                meetingLink: formData.meetingLink,
                notes: formData.notes
            });
        } else {
            // Se estiver criando, chama a função de criação
            onSubmit({
                patientId: formData.patientId,
                date: appointmentDateTime,
                hour: hours,
                minute: minutes,
                duration: formData.duration,
                type: formData.type,
                meetingLink: formData.meetingLink,
                notes: formData.notes
            });
        }

        // Resetar formulário (exceto quando estiver editando)
        if (!appointmentToEdit) {
            setFormData({
                patientId: null,
                date: defaultDate || null,
                time: "09:00",
                duration: 60,
                type: "presencial",
                meetingLink: "",
                notes: ""
            });
        }
    }

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date || undefined)
        setFormData(prev => ({
            ...prev,
            date: date || null
        }))
    }

    const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            time: e.target.value
        }))
    }

    // Gerar opções de horário (a cada 30 minutos)
    const timeOptions = []
    for (let hour = 7; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
            timeOptions.push(timeString)
        }
    }

    // Gerar opções de duração
    const durationOptions = [30, 45, 60, 90]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconWrapper
                            icon={Calendar}
                            variant="default"
                            size="xl"
                            className="ring-4 ring-background border border-white/10 dark:border-white/20 shadow-md"
                        />
                        Nova Consulta
                    </DialogTitle>
                    <DialogDescription>
                        Agende uma nova consulta para seu paciente
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Select de paciente */}
                        <div className="space-y-2">
                            <Label htmlFor="patient">Paciente *</Label>
                            <Select
                                value={formData.patientId?.toString() || ""}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: Number(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map(patient => (
                                        <SelectItem key={patient.id} value={patient.id.toString()}>
                                            {patient.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Seletor de data */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Data *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const dateString = e.target.value;
                                    const date = dateString ? new Date(dateString) : undefined;
                                    handleDateSelect(date && !isNaN(date.getTime()) ? date : undefined);
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seletor de horário */}
                        <div className="space-y-2">
                            <Label htmlFor="time">Horário *</Label>
                            <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeOptions.map(time => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Seletor de duração */}
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duração *</Label>
                            <Select
                                value={formData.duration.toString()}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: Number(value) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {durationOptions.map(duration => (
                                        <SelectItem key={duration} value={duration.toString()}>
                                            {duration} minutos
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seletor de tipo */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Consulta *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: "presencial" | "online" | "primeira_vez" | "retorno" | "em_grupo" | "pacote" | "permuta" | "pessoal" | "antropometria" | "amigo" | "encaixe" | "teste") => setFormData(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
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

                        {/* Link de reunião (apenas para online) */}
                        {formData.type === "online" && (
                            <div className="space-y-2">
                                <Label htmlFor="meetingLink">Link da Reunião</Label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="meetingLink"
                                        value={formData.meetingLink}
                                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                                        placeholder="https://meet.google.com/xxx-xxxx"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas</Label>
                        <Input
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Anotações adicionais..."
                        />
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!formData.patientId || !formData.date}
                    >
                        Agendar Consulta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}