"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Coffee,
    UtensilsCrossed,
    Cookie,
    Moon,
    Pill,
    Apple,
    Plus,
    Edit3,
    Trash2,
    ChevronDown,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { useDietEditorStore, FoodItem } from '@/stores/diet-editor-store'
import { Button } from '@/components/ui/button'

// Preset categories
const PRESET_CATEGORIES = [
    { id: 'cafe_da_manha', label: 'Café da Manhã', icon: Coffee, color: 'orange' },
    { id: 'lanche_manha', label: 'Lanche da Manhã', icon: Apple, color: 'green' },
    { id: 'almoco', label: 'Almoço', icon: UtensilsCrossed, color: 'blue' },
    { id: 'lanche_tarde', label: 'Lanche da Tarde', icon: Cookie, color: 'purple' },
    { id: 'jantar', label: 'Jantar', icon: UtensilsCrossed, color: 'indigo' },
    { id: 'ceia', label: 'Ceia', icon: Moon, color: 'slate' },
] as const

// Default presets (can be expanded by nutritionist)
const DEFAULT_PRESETS: Record<string, PresetItem[]> = {
    cafe_da_manha: [
        {
            name: 'Café Básico',
            items: [
                { customName: 'Pão integral (2 fatias)', quantity: 50, unit: 'g', calories: 130, protein: 5, carbs: 24, fats: 2, fiber: 3 },
                { customName: 'Queijo minas (2 fatias)', quantity: 30, unit: 'g', calories: 82, protein: 6, carbs: 1, fats: 6, fiber: 0 },
                { customName: 'Café com leite', quantity: 200, unit: 'ml', calories: 80, protein: 4, carbs: 10, fats: 3, fiber: 0 },
            ]
        },
        {
            name: 'Café Fit',
            items: [
                { customName: 'Omelete (2 ovos)', quantity: 100, unit: 'g', calories: 154, protein: 11, carbs: 1, fats: 12, fiber: 0 },
                { customName: 'Aveia', quantity: 30, unit: 'g', calories: 117, protein: 4, carbs: 20, fats: 2, fiber: 3 },
                { customName: 'Banana', quantity: 100, unit: 'g', calories: 89, protein: 1, carbs: 23, fats: 0, fiber: 3 },
            ]
        }
    ],
    almoco: [
        {
            name: 'Almoço Balanceado',
            items: [
                { customName: 'Arroz integral', quantity: 100, unit: 'g', calories: 111, protein: 3, carbs: 23, fats: 1, fiber: 2 },
                { customName: 'Feijão', quantity: 80, unit: 'g', calories: 77, protein: 5, carbs: 14, fats: 0, fiber: 6 },
                { customName: 'Frango grelhado', quantity: 120, unit: 'g', calories: 198, protein: 37, carbs: 0, fats: 4, fiber: 0 },
                { customName: 'Salada verde', quantity: 100, unit: 'g', calories: 20, protein: 2, carbs: 3, fats: 0, fiber: 2 },
            ]
        },
        {
            name: 'Almoço Low Carb',
            items: [
                { customName: 'Salmão grelhado', quantity: 150, unit: 'g', calories: 280, protein: 35, carbs: 0, fats: 15, fiber: 0 },
                { customName: 'Legumes salteados', quantity: 150, unit: 'g', calories: 75, protein: 3, carbs: 10, fats: 3, fiber: 4 },
                { customName: 'Azeite de oliva', quantity: 10, unit: 'ml', calories: 88, protein: 0, carbs: 0, fats: 10, fiber: 0 },
            ]
        }
    ]
}

interface PresetItem {
    name: string
    items: Omit<FoodItem, 'id' | 'food'>[]
}

export function MealPresetsPanel() {
    const [expandedCategory, setExpandedCategory] = useState<string | null>('cafe_da_manha')
    const { selectedMealId, applyPreset } = useDietEditorStore()

    const handleApplyPreset = (preset: PresetItem) => {
        if (!selectedMealId) return
        applyPreset(selectedMealId, preset.items.map(item => ({ ...item, food: null })))
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Presets de Refeição
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-foreground">
                    <Plus className="h-3 w-3 mr-1" />
                    Criar Preset
                </Button>
            </div>

            {!selectedMealId && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
                    Selecione uma refeição para aplicar presets
                </div>
            )}

            <div className="space-y-2">
                {PRESET_CATEGORIES.map((category) => (
                    <PresetCategory
                        key={category.id}
                        category={category}
                        presets={DEFAULT_PRESETS[category.id] || []}
                        isExpanded={expandedCategory === category.id}
                        onToggle={() => setExpandedCategory(
                            expandedCategory === category.id ? null : category.id
                        )}
                        onApply={handleApplyPreset}
                        canApply={!!selectedMealId}
                    />
                ))}
            </div>
        </div>
    )
}

interface PresetCategoryProps {
    category: typeof PRESET_CATEGORIES[number]
    presets: PresetItem[]
    isExpanded: boolean
    onToggle: () => void
    onApply: (preset: PresetItem) => void
    canApply: boolean
}

function PresetCategory({ category, presets, isExpanded, onToggle, onApply, canApply }: PresetCategoryProps) {
    const Icon = category.icon

    const colorClasses: Record<string, string> = {
        orange: 'text-orange-400 bg-orange-500/20',
        green: 'text-green-400 bg-green-500/20',
        blue: 'text-blue-400 bg-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/20',
        slate: 'text-slate-400 bg-slate-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/20',
    }

    return (
        <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[category.color]}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{category.label}</span>
                    <span className="text-xs text-slate-500">
                        {presets.length} {presets.length === 1 ? 'preset' : 'presets'}
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-0 space-y-2">
                            {presets.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-4">
                                    Nenhum preset nesta categoria
                                </p>
                            ) : (
                                presets.map((preset, index) => (
                                    <PresetCard
                                        key={index}
                                        preset={preset}
                                        onApply={() => onApply(preset)}
                                        canApply={canApply}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

interface PresetCardProps {
    preset: PresetItem
    onApply: () => void
    canApply: boolean
}

function PresetCard({ preset, onApply, canApply }: PresetCardProps) {
    const totals = preset.items.reduce(
        (acc, item) => ({
            calories: acc.calories + item.calories,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fats: acc.fats + item.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
    )

    return (
        <div className="rounded-lg bg-white/5 p-3 group">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">{preset.name}</h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded hover:bg-white/10">
                        <Edit3 className="h-3 w-3 text-slate-400" />
                    </button>
                    <button className="p-1 rounded hover:bg-red-500/20">
                        <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                </div>
            </div>

            {/* Items preview */}
            <div className="text-xs text-slate-400 mb-3">
                {preset.items.slice(0, 3).map((item, i) => (
                    <span key={i}>
                        {i > 0 && ' • '}
                        {item.customName}
                    </span>
                ))}
                {preset.items.length > 3 && (
                    <span> +{preset.items.length - 3} mais</span>
                )}
            </div>

            {/* Totals */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 text-xs text-slate-400">
                    <span>{totals.calories.toFixed(0)} kcal</span>
                    <span><span className="text-blue-400">{totals.carbs.toFixed(0)}g</span> C</span>
                    <span><span className="text-green-400">{totals.protein.toFixed(0)}g</span> P</span>
                    <span><span className="text-orange-400">{totals.fats.toFixed(0)}g</span> G</span>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onApply}
                    disabled={!canApply}
                    className="h-7 text-xs bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-foreground border border-indigo-500/30"
                >
                    Aplicar
                </Button>
            </div>
        </div>
    )
}
