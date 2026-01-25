"use client"

import React from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useDietEditorStore, WorkspaceMeal } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DietTopBar } from './meal-builder/DietTopBar'
import { DietMealCard } from './meal-builder/DietMealCard'

export function DietTemplateWorkspace() {
    const {
        workspaceMeals,
        addWorkspaceMeal,
        updateWorkspaceMeal,
        deleteWorkspaceMeal,
        copyWorkspaceMeal,
        addFoodToWorkspaceMeal,
        removeFoodFromWorkspaceMeal,
        dietType
    } = useDietEditorStore()

    const handleUpdateMeal = (index: number, updates: Partial<WorkspaceMeal>) => {
        const meal = workspaceMeals[index]
        if (meal) {
            updateWorkspaceMeal(meal.id, updates)
        }
    }

    const handleCopyMeal = (index: number) => {
        const meal = workspaceMeals[index]
        if (meal) {
            copyWorkspaceMeal(meal.id)
        }
    }

    const handleDeleteMeal = (index: number) => {
        const meal = workspaceMeals[index]
        if (meal) {
            deleteWorkspaceMeal(meal.id)
        }
    }

    const handleNewMeal = () => {
        const newId = workspaceMeals.length > 0 ? Math.max(...workspaceMeals.map(m => m.id)) + 1 : 1
        const defaultTime = workspaceMeals.length > 0 ? "00:00" : "07:00"
        addWorkspaceMeal({
            id: newId,
            type: '',
            time: defaultTime,
            observation: '',
            foods: [],
            isCollapsed: false,
        })
    }

    return (
        <div className="flex flex-col min-h-screen bg-background/50 pb-10">

            {/* 1. TOP BAR */}
            <DietTopBar />

            {/* 2. MEAL GRID AREA */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto min-h-full">

                    {/* Empty State - Only shows when no meals */}
                    <AnimatePresence>
                        {workspaceMeals.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card variant="glass" className="flex flex-col items-center justify-center p-24 border-dashed border-2 border-primary/20 bg-primary/5 rounded-[3rem] shadow-sm">
                                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                                        <Plus className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Comece o planejamento</h3>
                                    <p className="text-sm font-bold text-muted-foreground mb-10 max-w-sm text-center">Adicione a primeira refeição para começar a montar o ecossistema alimentar do seu paciente.</p>
                                    <Button type="button" onClick={handleNewMeal} size="lg" className="gap-3 h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/25 hover:scale-105 transition-all">
                                        <Plus className="w-5 h-5" /> Adicionar Refeição
                                    </Button>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Meal List Area */}
                    <div className={cn("space-y-10 transition-all", workspaceMeals.length === 0 ? "hidden" : "block")}>
                        <div className="flex flex-col gap-10">
                            {workspaceMeals.map((meal, index) => (
                                <div key={meal.id} className="animate-in fade-in slide-in-from-bottom-5 duration-500 fill-mode-forwards" style={{ animationDelay: `${index * 50}ms` }}>
                                    <DietMealCard
                                        meal={meal}
                                        index={index}
                                        onUpdate={(updates) => handleUpdateMeal(index, updates)}
                                        onDelete={() => handleDeleteMeal(index)}
                                        onCopy={() => handleCopyMeal(index)}
                                        onAddFood={addFoodToWorkspaceMeal}
                                        onRemoveFood={removeFoodFromWorkspaceMeal}
                                        compact={workspaceMeals.length > 4}
                                        dietType={dietType}
                                    />
                                </div>
                            ))}

                            {/* Add Button Card */}
                            <button
                                type="button"
                                onClick={handleNewMeal}
                                className="group w-full h-20 border-2 border-dashed border-border/40 rounded-[2rem] flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all px-8 gap-4 shadow-sm"
                            >
                                <div className="p-2 bg-muted/50 rounded-xl group-hover:bg-primary/10 group-hover:rotate-90 transition-all duration-300">
                                    <Plus className="w-5 h-5 group-hover:text-primary" />
                                </div>
                                <div className="flex flex-col items-start gap-0.5">
                                    <span className="text-xs font-black uppercase tracking-widest">Adicionar Nova Refeição</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. FIXED FOOTER REMOVED */}
        </div>
    )
}
