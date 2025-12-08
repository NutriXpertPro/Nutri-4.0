"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelRightClose,
    LayoutDashboard
} from 'lucide-react'
import { GlassPanel } from '../design/GlassPrimitives'
import { InlineFoodInput } from '../../meal-builder/InlineFoodInput'
import { useDietEditorMeals, useDietEditorStore, Meal, FoodItem } from '@/stores/diet-editor-store'
import { Food } from '@/services/food-service'
import { Button } from '@/components/ui/button'

export function MealStreamV3() {
    const meals = useDietEditorMeals()
    const { addMeal } = useDietEditorStore()

    return (
        <div className="space-y-8 pb-32">
            {meals.map((meal) => (
                <MealCardV3 key={meal.id} meal={meal} />
            ))}

            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(var(--primary), 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addMeal({ name: 'Nova Refeição', time: '00:00', order: meals.length, items: [] })}
                className="w-full py-8 text-sm font-medium text-muted-foreground border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" />
                Adicionar Refeição ao Fluxo
            </motion.button>
        </div>
    )
}

function MealCardV3({ meal }: { meal: Meal }) {
    const { removeFoodFromMeal, addFoodToMeal } = useDietEditorStore()

    const totals = meal.items.reduce((acc, item) => ({
        cals: acc.cals + item.calories,
        p: acc.p + item.protein,
        c: acc.c + item.carbs,
        f: acc.f + item.fats
    }), { cals: 0, p: 0, c: 0, f: 0 })

    return (
        <GlassPanel className="relative overflow-visible group" variant="base">
            {/* Header */}
            <div className="p-4 border-b border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary ring-1 ring-inset ring-primary/20">
                        <span className="text-xs font-mono font-bold">{meal.time}</span>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground">{meal.name}</h3>
                        <div className="flex gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
                            <span className="text-primary">{totals.cals.toFixed(0)} kcal</span>
                            <span>P: {totals.p.toFixed(0)}</span>
                            <span>C: {totals.c.toFixed(0)}</span>
                            <span>G: {totals.f.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Wand2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                {/* Food List */}
                <div className="space-y-1 mb-4">
                    {meal.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group/item transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-foreground font-medium">{item.food?.nome}</span>
                                <span className="text-xs text-muted-foreground">{item.quantity}{item.unit}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-mono text-muted-foreground">{item.calories.toFixed(0)} kcal</span>
                                <button
                                    onClick={() => removeFoodFromMeal(meal.id, item.id)}
                                    className="opacity-0 group-hover/item:opacity-100 text-red-500 hover:bg-red-500/10 p-1 rounded"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inline Input V3 (Themed) */}
                <div className="bg-muted/50 rounded-xl p-1 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                    <InlineFoodInput
                        onAddFood={(food: Food, qty: number, unit: string) => {
                            const ratio = qty / 100
                            addFoodToMeal(meal.id, {
                                food,
                                quantity: qty,
                                unit,
                                calories: food.energia_kcal * ratio,
                                protein: food.proteina_g * ratio,
                                carbs: food.carboidrato_g * ratio,
                                fats: food.lipidios_g * ratio,
                                fiber: (food.fibra_g || 0) * ratio
                            })
                        }}
                    />
                </div>
            </div>
        </GlassPanel>
    )
}

import {
    Search,
    Plus,
    Trash2,
    MoreHorizontal,
    Wand2
} from 'lucide-react'
