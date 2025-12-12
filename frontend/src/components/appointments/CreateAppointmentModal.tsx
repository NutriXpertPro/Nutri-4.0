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
import { Calendar } from "@/components/ui/calendar"
import {
    Clock,
    MapPin,
    Video,
    Users,
    Link
} from "lucide-react"
import { format, setHours, setMinutes, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

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
    type: "presencial" | "online"
    meetingLink: string
    notes: string
}

interface CreateAppointmentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patients: Patient[]
    onSubmit: (data: Omit<AppointmentFormData, 'time'> & { hour: number; minute: number }) => void
    defaultDate?: Date
}

export function CreateAppointmentModal({ 
    open, 
    onOpenChange, 
    patients,
    onSubmit,
    defaultDate
}: CreateAppointmentModalProps) {
    const [formData, setFormData] = useState<AppointmentFormData>({
        patientId: null,
        date: defaultDate || null,
        time: "09:00",
        duration: 60,
        type: "presencial",
        meetingLink: "",
        notes: ""
    })
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultDate)
    
    useEffect(() => {
        if (defaultDate) {
            setSelectedDate(defaultDate)
            setFormData(prev => ({
                ...prev,
                date: defaultDate
            }))
        }
    }, [defaultDate])

    const handleSubmit = () => {
        if (!formData.patientId || !formData.date) return
        
        // Converter a string de tempo em horas e minutos
        const [hours, minutes] = formData.time.split(':').map(Number)
        
        // Criar uma nova data combinando a data selecionada com a hora
        const appointmentDateTime = setHours(setMinutes(formData.date, minutes), hours)
        
        onSubmit({
            patientId: formData.patientId,
            date: appointmentDateTime,
            hour: hours,
            minute: minutes,
            duration: formData.duration,
            type: formData.type,
            meetingLink: formData.meetingLink,
            notes: formData.notes
        })
        
        // Resetar formulário
        setFormData({
            patientId: null,
            date: defaultDate || null,
            time: "09:00",
            duration: 60,
            type: "presencial",
            meetingLink: "",
            notes: ""
        })
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
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Calendar className="h-5 w-5" />
                        </div>
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
                                onValueChange={(value) => setFormData(prev => ({...prev, patientId: Number(value)}))}
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
                            <Label>Selecione a Data</Label>
                            <div className="border rounded-lg p-2">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={ptBR}
                                    initialFocus
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Seletor de horário */}
                        <div className="space-y-2">
                            <Label htmlFor="time">Horário *</Label>
                            <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({...prev, time: value}))}>
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
                                onValueChange={(value) => setFormData(prev => ({...prev, duration: Number(value)}))}
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
                                onValueChange={(value: "presencial" | "online") => setFormData(prev => ({...prev, type: value}))}
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
                                        onChange={(e) => setFormData(prev => ({...prev, meetingLink: e.target.value}))}
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
                            onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
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