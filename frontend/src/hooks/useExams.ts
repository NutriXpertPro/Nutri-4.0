import { useState, useEffect } from 'react'
import api from '@/services/api'

interface Exam {
    id: number
    file_name: string
    file_type: string
    notes: string
    uploaded_at: string
    file_url: string | null
}

export function useExams() {
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchExams = async () => {
        try {
            setLoading(true)
            const response = await api.get('/patients/me/exams/')
            setExams(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar exames')
            console.error('Error fetching exams:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchExams()
    }, [])

    return { exams, loading, error, refetch: fetchExams }
}
