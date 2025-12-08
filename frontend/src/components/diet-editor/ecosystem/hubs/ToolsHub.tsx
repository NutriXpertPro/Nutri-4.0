"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutGrid,
    Plus,
    Pill, // Supplement
    Search,
    Wand2,
    FlaskConical,
    Coffee,
    Utensils,
    Moon,
    Sun
} from 'lucide-react'
import { GlassPanel } from '../design/GlassPrimitives'
import { useDietEditorStore, Meal } from '@/stores/diet-editor-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Configuration Data for Presets
const MEAL_CATEGORIES = [
    {
        id: 'breakfast',
        label: 'Café da Manhã',
        icon: Coffee,
        color: 'text-amber-400',
        variations: [
            { id: 'low_carb', label: 'Low Carb (Ovos + Bacon)' },
            { id: 'high_carb', label: 'High Carb (Aveia + Frutas)' },
            { id: 'balanced', label: 'Balanceado (Pão Int. + Queijo)' },
            { id: 'jejum', label: 'Jejum (Café Preto)' },
        ]
    },
    {
        id: 'lunch',
        label: 'Almoço',
        icon: Sun,
        color: 'text-orange-400',
        variations: [
            { id: 'padrao', label: 'Padrão (Arroz, Feijão, Carne)' },
            { id: 'low_carb', label: 'Low Carb (Salada + Proteína)' },
            { id: 'vegan', label: 'Vegano (Grão de Bico)' },
            { id: 'off_season', label: 'Off-Season (Macarrão)' },
        ]
    },
    {
        id: 'snack',
        label: 'Lanche / Pré-Treino',
        icon: Utensils,
        color: 'text-blue-400',
        variations: [
            { id: 'proteico', label: 'Proteico (Whey + Fruta)' },
            { id: 'energetico', label: 'Energético (Açaí)' },
            { id: 'pratico', label: 'Prático (Barra de Proteína)' },
        ]
    },
    {
        id: 'dinner',
        label: 'Jantar',
        icon: Moon,
        color: 'text-indigo-400',
        variations: [
            { id: 'leve', label: 'Leve (Sopa/Caldo)' },
            { id: 'zerocarb', label: 'Zero Carb (Omelete)' },
            { id: 'recovery', label: 'Recovery (Batata + Peixe)' },
        ]
    }
]

export function ToolsHub() {
    const { addMeal } = useDietEditorStore()

    const handleAddPreset = (categoryLabel: string, variationLabel: string) => {
        // Here we would look up the actual food items for the preset.
        // For now, we create a placeholder meal.
        addMeal({
            name: `${categoryLabel} - ${variationLabel.split('(')[0].trim()}`,
            time: '08:00', // Default time, logic would adjust this
            order: 99,
            items: [] // In real app, populate with preset foods
        })
    }

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden border-l border-white/5 w-[280px]">
            {/* Hub Title */}
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Ferramentas & Presets
                </h3>
            </div>

            {/* Smart Presets */}
            <div className="mb-8 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border/20">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary mb-4">
                    <Wand2 className="h-4 w-4" />
                    Refeições Inteligentes
                </h4>

                <div className="space-y-6">
                    {MEAL_CATEGORIES.map((category) => {
                        const Icon = category.icon
                        return (
                            <div key={category.id} className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`h-3.5 w-3.5 ${category.color}`} />
                                    <Label className="text-xs font-medium text-foreground">{category.label}</Label>
                                </div>

                                <Select onValueChange={(val) => {
                                    const variation = category.variations.find(v => v.id === val)
                                    if (variation) handleAddPreset(category.label, variation.label)
                                }}>
                                    <SelectTrigger className="h-8 text-xs bg-muted/40 border-border/40 focus:ring-primary/20">
                                        <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {category.variations.map((variant) => (
                                            <SelectItem key={variant.id} value={variant.id} className="text-xs">
                                                {variant.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Section: Supplements (Compact) */}
            <div className="pt-4 border-t border-border/10">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-3">
                    <FlaskConical className="h-4 w-4" />
                    Suplementação (Rápida)
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    {['Whey', 'Creatina', 'Omega 3', 'Cafeína'].map((supp) => (
                        <Button
                            key={supp}
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] bg-slate-800/40 border-white/5 hover:border-emerald-500/30 hover:text-emerald-400"
                        >
                            <Plus className="h-2 w-2 mr-1" /> {supp}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
