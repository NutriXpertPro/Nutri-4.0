"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Wheat, Drumstick, Droplet, AlertTriangle, CheckCircle } from 'lucide-react'
import { useDietEditorStore, useDietEditorMeals, useDietEditorTargets } from '@/stores/diet-editor-store'

export function AnalyticsBar() {
    const meals = useDietEditorMeals()
    const { calories: targetCalories, macros: targetMacros } = useDietEditorTargets()

    // Calculate current totals
    const totals = meals.reduce(
        (acc, meal) => {
            meal.items.forEach((item) => {
                acc.calories += item.calories
                acc.carbs += item.carbs
                acc.protein += item.protein
                acc.fats += item.fats
            })
            return acc
        },
        { calories: 0, carbs: 0, protein: 0, fats: 0 }
    )

    const caloriePercentage = targetCalories > 0 ? (totals.calories / targetCalories) * 100 : 0
    const carbsPercentage = targetMacros.carbs > 0 ? (totals.carbs / targetMacros.carbs) * 100 : 0
    const proteinPercentage = targetMacros.protein > 0 ? (totals.protein / targetMacros.protein) * 100 : 0
    const fatsPercentage = targetMacros.fats > 0 ? (totals.fats / targetMacros.fats) * 100 : 0

    const isOverCalories = caloriePercentage > 100
    const isNearTarget = caloriePercentage >= 90 && caloriePercentage <= 110

    return (
        <div className="h-20 border-t border-white/10 bg-black/30 backdrop-blur-xl px-6 flex items-center gap-6">
            {/* Calorie Gauge */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <svg className="w-14 h-14 -rotate-90">
                        <circle
                            cx="28"
                            cy="28"
                            r="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-white/10"
                        />
                        <motion.circle
                            cx="28"
                            cy="28"
                            r="24"
                            fill="none"
                            stroke="url(#calorieGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.min(caloriePercentage, 100) * 1.508} 150.8`}
                            initial={{ strokeDasharray: '0 150.8' }}
                            animate={{ strokeDasharray: `${Math.min(caloriePercentage, 100) * 1.508} 150.8` }}
                        />
                        <defs>
                            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Flame className={`h-5 w-5 ${isOverCalories ? 'text-red-400' : isNearTarget ? 'text-green-400' : 'text-indigo-400'}`} />
                    </div>
                </div>
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${isOverCalories ? 'text-red-400' : 'text-white'}`}>
                            {totals.calories.toFixed(0)}
                        </span>
                        <span className="text-sm text-slate-400">/ {targetCalories}</span>
                    </div>
                    <p className="text-xs text-slate-400">kcal</p>
                </div>
            </div>

            {/* Separator */}
            <div className="h-10 w-px bg-white/10" />

            {/* Macro Bars */}
            <div className="flex-1 flex gap-6">
                <MacroBar
                    icon={<Wheat className="h-4 w-4" />}
                    label="Carbs"
                    current={totals.carbs}
                    target={targetMacros.carbs}
                    percentage={carbsPercentage}
                    color="blue"
                />
                <MacroBar
                    icon={<Drumstick className="h-4 w-4" />}
                    label="Proteína"
                    current={totals.protein}
                    target={targetMacros.protein}
                    percentage={proteinPercentage}
                    color="green"
                />
                <MacroBar
                    icon={<Droplet className="h-4 w-4" />}
                    label="Gordura"
                    current={totals.fats}
                    target={targetMacros.fats}
                    percentage={fatsPercentage}
                    color="orange"
                />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
                {isNearTarget ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Na meta</span>
                    </div>
                ) : isOverCalories ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Acima da meta</span>
                    </div>
                ) : caloriePercentage < 50 && targetCalories > 0 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Baixo consumo</span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

interface MacroBarProps {
    icon: React.ReactNode
    label: string
    current: number
    target: number
    percentage: number
    color: 'blue' | 'green' | 'orange'
}

function MacroBar({ icon, label, current, target, percentage, color }: MacroBarProps) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-500',
            text: 'text-blue-400',
            track: 'bg-blue-500/20',
        },
        green: {
            bg: 'bg-green-500',
            text: 'text-green-400',
            track: 'bg-green-500/20',
        },
        orange: {
            bg: 'bg-orange-500',
            text: 'text-orange-400',
            track: 'bg-orange-500/20',
        },
    }

    const isOver = percentage > 100

    return (
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <div className={`flex items-center gap-1.5 ${colorClasses[color].text}`}>
                    {icon}
                    <span className="text-xs font-medium">{label}</span>
                </div>
                <div className="text-xs">
                    <span className={isOver ? 'text-red-400 font-medium' : 'text-white'}>
                        {current.toFixed(0)}g
                    </span>
                    <span className="text-slate-500"> / {target}g</span>
                </div>
            </div>
            <div className={`h-2 rounded-full ${colorClasses[color].track} overflow-hidden`}>
                <motion.div
                    className={`h-full rounded-full ${isOver ? 'bg-red-500' : colorClasses[color].bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}
