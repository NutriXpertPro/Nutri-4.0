"use client"

import { Clock, Check, MoreHorizontal, Utensils, Coffee, Apple, Moon, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useMeals } from "@/hooks/useMeals"
import { Button } from "@/components/ui/button"

export function DietTab() {
    const { meals, loading, error, checkInMeal } = useMeals()

    const handleCheckIn = async (mealId: number) => {
        try {
            await checkInMeal(mealId)
        } catch (err) {
            console.error('Failed to check in meal:', err)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pb-24">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando plano alimentar...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen pb-24">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-destructive mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()} size="sm">
                        Tentar Novamente
                    </Button>
                </div>
            </div>
        )
    }

    const getIcon = (name: string) => {
        if (name.includes('Café')) return Coffee
        if (name.includes('Lanche')) return Apple
        if (name.includes('Almoço') || name.includes('Jantar')) return Utensils
        if (name.includes('Ceia')) return Moon
        return Utensils
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-foreground">Seu Plano de Hoje</h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                    1.800 kcal
                </span>
            </div>

            <div className="space-y-4">
                {meals.map((meal, index) => {
                    const Icon = getIcon(meal.name)
                    const isCompleted = meal.status === "completed"
                    const isCurrent = meal.status === "current"

                    return (
                        <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`
                                relative overflow-hidden rounded-2xl p-4 border transition-all duration-300
                                ${isCurrent ?
                                    "bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10" :
                                    "bg-card/40 border-border/10 hover:bg-card/60"}
                            `}
                        >
                            {isCompleted && (
                                <div className="absolute right-0 top-0 p-2 bg-primary/20 rounded-bl-2xl">
                                    <Check className="w-4 h-4 text-primary" />
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-lg text-foreground">{meal.name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {meal.time}
                                        </div>
                                    </div>

                                    <ul className="space-y-1 mb-3">
                                        {meal.foods.map((food, i) => (
                                            <li key={i} className="text-sm text-foreground/70 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-border" />
                                                {food}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/10">
                                        <span className="text-xs font-medium text-muted-foreground">{meal.calories} kcal</span>
                                        <button
                                            onClick={() => handleCheckIn(meal.id)}
                                            className={`
                                                text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                                                ${isCompleted ? "text-primary bg-primary/10" : "text-foreground bg-muted hover:bg-muted/80"}
                                            `}
                                        >
                                            {isCompleted ? "Registrado" : "Registrar Refeição"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
