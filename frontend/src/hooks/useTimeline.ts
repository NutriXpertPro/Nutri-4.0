import { useState, useEffect } from 'react'
import { mealsAPI } from '@/services/api'

interface TimelineEvent {
    id: number
    time: string
    title: string
    subtitle: string
    type: 'meal' | 'workout' | 'appointment' | 'evaluation'
    kcal?: number
    protein?: string
    carbs?: string
    fat?: string
    duration?: string
    description: string
    status: 'completed' | 'current' | 'upcoming'
}

export function useTimeline() {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTimeline = async () => {
        try {
            setLoading(true)
            const response = await mealsAPI.getMeals()

            // Transform meals into timeline events
            const mealEvents: TimelineEvent[] = response.data.map((meal: any) => ({
                id: meal.id,
                time: meal.time,
                title: meal.name,
                subtitle: meal.foods?.slice(0, 2).join(' + ') || '',
                type: 'meal' as const,
                kcal: meal.calories,
                protein: `${Math.round(meal.calories * 0.25 / 4)}g`,
                carbs: `${Math.round(meal.calories * 0.40 / 4)}g`,
                fat: `${Math.round(meal.calories * 0.35 / 9)}g`,
                description: meal.foods?.join(', ') || '',
                status: meal.status
            }))

            setEvents(mealEvents)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar timeline')
            console.error('Error fetching timeline:', err)
        } finally {
            setLoading(false)
        }
    }

    const checkIn = async (eventId: number) => {
        try {
            await mealsAPI.checkInMeal(eventId)
            // Update local state
            setEvents(prev => prev.map(event =>
                event.id === eventId ? { ...event, status: 'completed' as const } : event
            ))
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao fazer check-in')
            throw err
        }
    }

    useEffect(() => {
        fetchTimeline()
    }, [])

    return { events, loading, error, refetch: fetchTimeline, checkIn }
}
