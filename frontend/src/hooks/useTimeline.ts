import { useState, useEffect } from 'react'
import { mealsAPI } from '@/services/api'

interface FoodItem {
    name: string
    quantity: number
    unit: string
    kcal: number
    protein: number
    carbs: number
    fats: number
    substitutions: Array<{
        name: string
        quantity: number
        unit: string
    }>
}

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
    items?: FoodItem[]
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
                subtitle: meal.items?.slice(0, 2).map((i: any) => i.name).join(' + ') || '',
                type: 'meal' as const,
                kcal: meal.calories,
                protein: `${meal.protein}g`,
                carbs: `${meal.carbs}g`,
                fat: `${meal.fats}g`,
                description: meal.items?.map((i: any) => `${i.name} (${i.quantity}${i.unit})`).join(', ') || '',
                status: meal.status,
                items: meal.items
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

    const uploadMealPhoto = async (mealId: number, photo: File) => {
        try {
            const formData = new FormData()
            formData.append('photo', photo)
            await mealsAPI.uploadMealPhoto(mealId, formData)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao enviar foto')
            throw err
        }
    }

    const checkInAll = async () => {
        try {
            await mealsAPI.checkInAll()
            // Update all local meal events to completed
            setEvents(prev => prev.map(event =>
                event.type === 'meal' ? { ...event, status: 'completed' as const } : event
            ))
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao registrar todas as refeições')
            throw err
        }
    }

    useEffect(() => {
        fetchTimeline()
    }, [])

    return { events, loading, error, refetch: fetchTimeline, checkIn, uploadMealPhoto, checkInAll }
}
