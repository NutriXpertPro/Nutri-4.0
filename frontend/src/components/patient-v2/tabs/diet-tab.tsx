"use client"

import { Clock, Check, MoreHorizontal, Utensils, Coffee, Apple, Moon, Loader2, AlertCircle, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { useMeals } from "@/hooks/useMeals"
import { Button } from "@/components/ui/button"

export function DietTab() {
    const { meals, loading, error, checkInMeal, checkInAll } = useMeals()

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
            <div className="flex items-center justify-center min-h-[400px] pb-24">
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
            <div className="flex items-center justify-center min-h-[400px] pb-24">
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
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Seu Plano de Hoje</h2>
                    <button
                        onClick={() => checkInAll?.()}
                        className="text-[10px] mt-1 text-primary font-bold hover:underline flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-tighter"
                    >
                        <Trophy className="w-2.5 h-2.5" /> Registrar Todas
                    </button>
                </div>
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
                                relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 shadow-sm
                                ${isCurrent ?
                                    "bg-gradient-to-br from-card to-muted border-primary/50 shadow-md shadow-primary/10" :
                                    "bg-card border-border hover:border-primary/20"}
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

                                    <div className="space-y-2 mb-3">
                                        {(meal.items && meal.items.length > 0) ? (
                                            meal.items.map((item, i) => (
                                                <div key={i} className="text-sm text-foreground/70 flex flex-col gap-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-emerald-500">{item.quantity}{item.unit}</span>
                                                    </div>
                                                    {item.substitutions && item.substitutions.length > 0 ? (
                                                        <div className="pl-3 mt-1">
                                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">Opções de Troca:</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.substitutions.map((s: any, idx: number) => (
                                                                    <span key={idx} className="text-xs bg-muted px-2 py-1 rounded-md border border-border text-foreground">
                                                                        {s.name} <span className="text-primary font-bold">({s.quantity}{s.unit})</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Placeholder Debug - Remover em produção se visualmente poluído */
                                                        <div className="pl-3 mt-1 opacity-40 text-[10px] italic text-muted-foreground hidden">
                                                            Sem trocas diretas.
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            meal.foods?.map((food, i) => (
                                                <li key={i} className="text-sm text-foreground/70 flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-border" />
                                                    {food}
                                                </li>
                                            ))
                                        )}
                                    </div>

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
