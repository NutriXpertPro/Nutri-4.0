import { useState, useEffect } from 'react'
import { evolutionAPI } from '@/services/api'

interface EvolutionData {
    date: string
    value: number | null
}

export function useEvolution(metric: 'weight' | 'fat' | 'muscle' = 'weight') {
    const [data, setData] = useState<EvolutionData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEvolution = async () => {
        try {
            setLoading(true)
            const response = await evolutionAPI.getEvolution(metric)
            setData(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar evolução')
            console.error('Error fetching evolution:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvolution()
    }, [metric])

    return { data, loading, error, refetch: fetchEvolution }
}

interface Measurement {
    bodyPart: string
    initial: number
    current: number
    unit: string
}

export function useMeasurements() {
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMeasurements = async () => {
        try {
            setLoading(true)
            const response = await evolutionAPI.getMeasurements()
            setMeasurements(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar medidas')
            console.error('Error fetching measurements:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeasurements()
    }, [])

    return { measurements, loading, error, refetch: fetchMeasurements }
}
