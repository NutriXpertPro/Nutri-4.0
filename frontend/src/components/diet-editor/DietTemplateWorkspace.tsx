"use client"

import React from 'react'
import { Plus } from 'lucide-react'
import { useDietEditorStore, WorkspaceMeal } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { DietTopBar } from './meal-builder/DietTopBar'
import { DietMealCard } from './meal-builder/DietMealCard'
import { DietDayFooter } from './meal-builder/DietDayFooter'

export function DietTemplateWorkspace() {
    const {
        workspaceMeals,
        addWorkspaceMeal,
        updateWorkspaceMeal,
        deleteWorkspaceMeal,
        copyWorkspaceMeal,
        addFoodToWorkspaceMeal,
        removeFoodFromWorkspaceMeal
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
            type: 'Nova Refeição',
            time: defaultTime,
            observation: '',
            foods: [],
            isCollapsed: false,
        })
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-32"> {/* pb-32 to accomodate valid footer */}

            {/* 1. TOP BAR */}
            <DietTopBar />

            {/* 2. MEAL GRID AREA */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-[1800px] mx-auto">
                    {workspaceMeals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Comece seu dia</h3>
                            <p className="text-sm text-muted-foreground mb-6">Adicione a primeira refeição para começar o planejamento.</p>
                            <Button onClick={handleNewMeal} className="gap-2">
                                <Plus className="w-4 h-4" /> Adicionar Refeição
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* Layout Horizontal: Single Column (Full Width) as requested */}
                            <div className="grid grid-cols-1 gap-6 items-start">
                                {workspaceMeals.map((meal, index) => (
                                    <DietMealCard
                                        key={meal.id}
                                        meal={meal}
                                        index={index}
                                        onUpdate={(updates) => handleUpdateMeal(index, updates)}
                                        onDelete={() => handleDeleteMeal(index)}
                                        onCopy={() => handleCopyMeal(index)}
                                        onAddFood={addFoodToWorkspaceMeal}
                                        onRemoveFood={removeFoodFromWorkspaceMeal}
                                        compact={workspaceMeals.length > 3} // Auto-compact if many meals
                                    />
                                ))}

                                {/* Add Button Card */}
                                <button
                                    onClick={handleNewMeal}
                                    className="h-full min-h-[100px] border-2 border-dashed border-border/60 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all p-6 gap-2"
                                >
                                    <div className="p-2 bg-muted rounded-full">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="font-medium">Adicionar Nova Refeição</span>
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* 3. FIXED FOOTER */}
            <DietDayFooter />
        </div>
    )
}
