import { useState, useEffect } from 'react'
import { mealsAPI } from '@/services/api'

interface MealItem {
    name: string
    quantity: number
    unit: string
    kcal?: number
    substitutions: any[]
}

interface Meal {
    id: number
    name: string
    time: string
    calories: number
    items: MealItem[]
    foods: string[] // Manter para compatibilidade legada se necessário
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
            // Lógica para garantir compatibilidade com componentes que ainda usam .foods
            const transformedMeals = response.data.map((meal: any) => ({
                ...meal,
                foods: meal.items?.map((i: any) => `${i.name} (${i.quantity}${i.unit})`) || []
            }))
            setMeals(transformedMeals)
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
            setMeals(prev => prev.map(meal =>
                meal.id === mealId ? { ...meal, status: 'completed' as const } : meal
            ))
            await fetchMeals()
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao registrar refeição')
            throw err
        }
    }

    const checkInAll = async () => {
        try {
            await mealsAPI.checkInAll()
            setMeals(prev => prev.map(meal => ({ ...meal, status: 'completed' as const })))
            await fetchMeals()
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao registrar todas as refeições')
            throw err
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [date])

    return { meals, loading, error, refetch: fetchMeals, checkInMeal, checkInAll }
}
