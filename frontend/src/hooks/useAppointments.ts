import { useState, useEffect } from 'react'
import { appointmentsAPI } from '@/services/api'

interface Appointment {
    id: number
    date: string
    rawDate: Date
    time: string
    title: string
    specialty: string
    type: 'Online' | 'Presencial'
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
    videoLink?: string
    location?: string
    avatar?: string
    notes?: string
}

export function useAppointments(status?: 'upcoming' | 'past') {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            const response = await appointmentsAPI.getAppointments(status)
            setAppointments(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar consultas')
            console.error('Error fetching appointments:', err)
        } finally {
            setLoading(false)
        }
    }

    const confirmAppointment = async (appointmentId: number) => {
        try {
            await appointmentsAPI.confirmAppointment(appointmentId)
            await fetchAppointments()
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao confirmar consulta')
            console.error('Error confirming appointment:', err)
            throw err
        }
    }

    const cancelAppointment = async (appointmentId: number) => {
        try {
            await appointmentsAPI.cancelAppointment(appointmentId)
            // Optimistic update
            setAppointments(prev => prev.map(apt =>
                apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
            ))
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao cancelar consulta')
            console.error('Error cancelling appointment:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [status])

    return { appointments, loading, error, refetch: fetchAppointments, confirmAppointment, cancelAppointment }
}
