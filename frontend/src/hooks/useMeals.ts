import { useState, useEffect } from 'react'
import { mealsAPI } from '@/services/api'

interface Meal {
    id: number
    name: string
    time: string
    calories: number
    foods: string[]
    status: 'completed' | 'current' | 'upcoming'
    icon?: any
}

export function useMeals(date?: string) {
    const [meals, setMeals] = useState<Meal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMeals = async () => {
        try {
            setLoading(true)
            const response = await mealsAPI.getMeals(date)
            setMeals(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar refeições')
            console.error('Error fetching meals:', err)
        } finally {
            setLoading(false)
        }
    }

    const checkInMeal = async (mealId: number) => {
        try {
            await mealsAPI.checkInMeal(mealId)
            // Optimistic update
            setMeals(prev => prev.map(meal =>
                meal.id === mealId ? { ...meal, status: 'completed' as const } : meal
            ))
            await fetchMeals() // Re-fetch to get server data
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao registrar refeição')
            console.error('Error checking in meal:', err)
            throw err
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [date])

    return { meals, loading, error, refetch: fetchMeals, checkInMeal }
}
