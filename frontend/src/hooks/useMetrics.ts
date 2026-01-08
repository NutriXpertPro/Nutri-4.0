import { useState, useEffect } from 'react'
import { metricsAPI } from '@/services/api'

interface Metrics {
    calories: {
        current: number
        goal: number
        unit: string
    }
    water: {
        current: number
        goal: number
        unit: string
    }
    focus: {
        current: number
        goal: number
        unit: string
    }
}

export function useMetrics() {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMetrics = async () => {
        try {
            setLoading(true)
            const response = await metricsAPI.getMetrics()
            setMetrics(response.data)
            setError(null)
        } catch (err: any) {
            if (err?.response?.status === 404) {
                // Return default/empty metrics instead of error for 404 (Profile not found)
                setMetrics({
                    calories: { current: 0, goal: 1800, unit: 'kcal' },
                    water: { current: 0, goal: 2.5, unit: 'L' },
                    focus: { current: 0, goal: 100, unit: '%' }
                })
                setError(null)
            } else {
                setError(err?.response?.data?.message || 'Erro ao carregar métricas')
                console.error('Error fetching metrics:', err)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMetrics()
    }, [])

    return { metrics, loading, error, refetch: fetchMetrics }
}
