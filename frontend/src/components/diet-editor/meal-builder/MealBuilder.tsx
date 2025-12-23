"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, GripVertical, Trash2, Copy, MoreHorizontal } from 'lucide-react'
import { useDietEditorStore, useDietEditorMeals } from '@/stores/diet-editor-store'
import { Button } from '@/components/ui/button'

const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export function MealBuilder() {
    const { currentDayIndex, setCurrentDay, addMeal, selectMeal, selectedMealId } = useDietEditorStore()
    const meals = useDietEditorMeals()

    const handleAddMeal = () => {
        addMeal({
            name: 'Nova Refeição',
            time: '12:00',
            order: meals.length,
            items: [],
        })
    }

    return (
        <div className="h-full flex flex-col">
            {/* Week Day Tabs */}
            <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
                {DAYS_OF_WEEK.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentDay(index)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${currentDayIndex === index
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {day.substring(0, 3)}
                    </button>
                ))}
            </div>

            {/* Meals Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                {meals.map((meal, index) => (
                    <MealCard
                        key={meal.id}
                        meal={meal}
                        index={index}
                        isSelected={selectedMealId === meal.id}
                        onSelect={() => selectMeal(meal.id)}
                    />
                ))}

                {/* Add Meal Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddMeal}
                    className="min-h-[200px] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
                >
                    <Plus className="h-8 w-8" />
                    <span className="text-sm font-medium">Adicionar Refeição</span>
                </motion.button>
            </div>
        </div>
    )
}

interface MealCardProps {
    meal: ReturnType<typeof useDietEditorMeals>[0]
    index: number
    isSelected: boolean
    onSelect: () => void
}

function MealCard({ meal, index, isSelected, onSelect }: MealCardProps) {
    const { updateMeal, removeMeal, removeFoodFromMeal } = useDietEditorStore()

    // Calculate meal totals
    const totals = meal.items.reduce(
        (acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fats: acc.fats + item.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onSelect}
            className={`rounded-xl bg-white/5 border transition-all cursor-pointer ${isSelected
                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20'
                : 'border-white/10 hover:border-white/20'
                }`}
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-slate-500 cursor-grab" />
                        <input
                            type="text"
                            value={meal.name}
                            onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent font-medium text-white border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 -ml-1"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                            <Clock className="h-3 w-3" />
                            <input
                                type="time"
                                value={meal.time}
                                onChange={(e) => updateMeal(meal.id, { time: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-transparent border-none focus:outline-none text-sm w-16"
                            />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Excluir esta refeição?')) {
                                    removeMeal(meal.id)
                                }
                            }}
                            className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Excluir Refeição"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Food Items */}
            <div className="p-4 min-h-[100px]">
                {meal.items.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm">
                        <p>Arraste alimentos aqui</p>
                        <p className="text-xs mt-1">ou clique para buscar</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {meal.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-white/5 group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">
                                        {item.food?.nome || item.customName || 'Alimento'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {item.quantity}{item.unit} • {item.calories.toFixed(0)} kcal
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFoodFromMeal(meal.id, item.id)
                                    }}
                                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-opacity"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - Totals */}
            <div className="px-4 py-3 border-t border-white/10 bg-white/5 rounded-b-xl">
                <div className="flex justify-between text-xs">
                    <span className="text-white font-medium">{totals.calories.toFixed(0)} kcal</span>
                    <div className="flex gap-3 text-slate-400">
                        <span><span className="text-blue-400">{totals.carbs.toFixed(0)}g</span> C</span>
                        <span><span className="text-green-400">{totals.protein.toFixed(0)}g</span> P</span>
                        <span><span className="text-orange-400">{totals.fats.toFixed(0)}g</span> G</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
