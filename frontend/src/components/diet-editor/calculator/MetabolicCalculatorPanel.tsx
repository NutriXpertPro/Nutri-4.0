"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Calculator, Flame, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
    useDietEditorStore,
    DIET_TYPE_MACROS,
    ACTIVITY_LEVELS,
    CalculationMethod,
    DietType
} from '@/stores/diet-editor-store'

const CALCULATION_METHODS: { value: CalculationMethod; label: string; description: string }[] = [
    { value: 'mifflin', label: 'Mifflin-St Jeor', description: 'Mais preciso para adultos' },
    { value: 'harris_benedict', label: 'Harris-Benedict', description: 'Fórmula clássica' },
    { value: 'cunningham', label: 'Cunningham', description: 'Baseado em massa magra' },
    { value: 'katch_mcardle', label: 'Katch-McArdle', description: 'Usa % gordura corporal' },
]

export function MetabolicCalculatorPanel() {
    const {
        patient,
        calculationMethod,
        setCalculationMethod,
        dietType,
        setDietType,
        activityLevel,
        setActivityLevel,
        goalAdjustment,
        setGoalAdjustment,
        tmb,
        get,
        targetCalories,
        targetMacros,
    } = useDietEditorStore()

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
        >
            {/* Calculation Method */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-400" />
                    Método de Cálculo
                </h4>
                <div className="space-y-2">
                    {CALCULATION_METHODS.map((method) => (
                        <button
                            key={method.value}
                            onClick={() => setCalculationMethod(method.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${calculationMethod === method.value
                                    ? 'bg-indigo-500/30 border border-indigo-500/50'
                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <p className="text-sm font-medium text-white">{method.label}</p>
                            <p className="text-xs text-slate-400">{method.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Diet Type Selector */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    Tipo de Dieta
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(DIET_TYPE_MACROS) as [DietType, typeof DIET_TYPE_MACROS[DietType]][]).map(([type, data]) => (
                        <button
                            key={type}
                            onClick={() => setDietType(type)}
                            className={`text-left px-3 py-2 rounded-lg transition-all ${dietType === type
                                    ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-500/50'
                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <p className="text-sm font-medium text-white">{data.label}</p>
                            <p className="text-xs text-slate-400">
                                C:{data.carbs}% P:{data.protein}% G:{data.fats}%
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Level */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Nível de Atividade
                </h4>
                <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((level) => (
                        <button
                            key={level.value}
                            onClick={() => setActivityLevel(level.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all ${activityLevel === level.value
                                    ? 'bg-yellow-500/30 border border-yellow-500/50'
                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-white">{level.label}</p>
                                <span className="text-xs text-slate-400">×{level.value}</span>
                            </div>
                            <p className="text-xs text-slate-400">{level.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Goal Adjustment Slider */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    {goalAdjustment > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    ) : goalAdjustment < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                    ) : (
                        <Minus className="h-4 w-4 text-slate-400" />
                    )}
                    Ajuste Calórico
                </h4>
                <div className="space-y-3">
                    <input
                        type="range"
                        min="-500"
                        max="500"
                        step="50"
                        value={goalAdjustment}
                        onChange={(e) => setGoalAdjustment(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs">
                        <span className="text-red-400">-500</span>
                        <span className={`font-medium ${goalAdjustment > 0 ? 'text-green-400' :
                                goalAdjustment < 0 ? 'text-red-400' : 'text-slate-400'
                            }`}>
                            {goalAdjustment > 0 ? '+' : ''}{goalAdjustment} kcal
                        </span>
                        <span className="text-green-400">+500</span>
                    </div>
                </div>
            </div>

            {/* Results */}
            {patient && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-4"
                >
                    <h4 className="text-sm font-medium text-white mb-4">Valores Calculados</h4>

                    <div className="grid grid-cols-2 gap-3">
                        <ResultCard label="TMB" value={tmb} unit="kcal" color="blue" />
                        <ResultCard label="GET" value={get} unit="kcal" color="green" />
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-white/10">
                        <div className="text-center mb-3">
                            <p className="text-xs text-slate-400">Meta Diária</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                {targetCalories}
                            </p>
                            <p className="text-xs text-slate-400">kcal</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-lg font-semibold text-blue-400">{targetMacros.carbs}g</p>
                                <p className="text-xs text-slate-400">Carbs</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-green-400">{targetMacros.protein}g</p>
                                <p className="text-xs text-slate-400">Proteína</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-orange-400">{targetMacros.fats}g</p>
                                <p className="text-xs text-slate-400">Gordura</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

interface ResultCardProps {
    label: string
    value: number
    unit: string
    color: 'blue' | 'green'
}

function ResultCard({ label, value, unit, color }: ResultCardProps) {
    const colorClass = color === 'blue' ? 'text-blue-400' : 'text-green-400'

    return (
        <div className="rounded-lg bg-white/5 p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-xs text-slate-400">{unit}</p>
        </div>
    )
}
