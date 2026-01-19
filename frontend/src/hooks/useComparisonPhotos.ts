import { useState, useEffect } from 'react'
import { evolutionAPI } from '@/services/api'

interface PhotoComparison {
    initial: {
        front: string | null
        side: string | null
        back: string | null
        date: string | null
    }
    current: {
        front: { url: string; date: string } | null
        side: { url: string; date: string } | null
        back: { url: string; date: string } | null
    }
}

export function useComparisonPhotos() {
    const [comparison, setComparison] = useState<PhotoComparison | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchComparison = async () => {
        try {
            setLoading(true)
            const response = await evolutionAPI.getComparisonPhotos()
            setComparison(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar fotos de comparação')
            console.error('Error fetching photo comparison:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComparison()
    }, [])

    return { comparison, loading, error, refetch: fetchComparison }
}
