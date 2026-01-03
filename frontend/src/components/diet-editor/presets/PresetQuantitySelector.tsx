"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MealPresetFood } from '@/stores/diet-editor-store'
import { Ruler, Scale, Utensils } from 'lucide-react'
import { cn } from "@/lib/utils"

interface PresetQuantitySelectorProps {
    food: MealPresetFood
    onChange: (quantity: number, unit: string) => void
}

// Standard fallback if no specific checks exist
const STANDARD_MEASURES: Record<string, { label: string, weight: number }> = {
    'g': { label: 'g', weight: 1 },
    'ml': { label: 'ml', weight: 1 },
    'col_sopa': { label: 'Colher de Sopa', weight: 25 },
    'col_cha': { label: 'Colher de Chá', weight: 5 },
    'xicara': { label: 'Xícara', weight: 240 },
    'copo': { label: 'Copo', weight: 200 },
    'fatia': { label: 'Fatia', weight: 30 },
    'unidade': { label: 'Unidade', weight: 100 },
}

export function PresetQuantitySelector({ food, onChange }: PresetQuantitySelectorProps) {
    // Simple heuristic to check if food is liquid (based on name or group if available)
    const isLiquid = useMemo(() => {
        const name = food.food_name.toLowerCase()
        const keywords = ['suco', 'leite', 'água', 'agua', 'refrigerante', 'chá', 'cha', 'café', 'cafe', 'vitamina', 'caldo', 'sopa', 'iogurte', 'bebida', 'vinho', 'cerveja']
        return keywords.some(k => name.includes(k))
    }, [food.food_name])

    // Current measure used for display logic
    const currentUnit = food.unit && food.unit !== 'default' ? food.unit : (isLiquid ? 'ml' : 'g')

    // Compute available options
    const options = useMemo(() => {
        const opts = []

        // Base unit: g or ml
        if (isLiquid) {
            opts.push({ value: 'ml', label: 'ml', weight: 1, fullLabel: 'Mililitros (ml)' })
        } else {
            opts.push({ value: 'g', label: 'g', weight: 1, fullLabel: 'Gramas (g)' })
        }

        // 3. Fallbacks (Standard Measures)
        // Only add if relevant. E.g., 'Fatia' for liquids makes no sense.
        const commonKeys = ['col_sopa', 'col_cha', 'xicara', 'copo']
        if (!isLiquid) commonKeys.push('fatia', 'unidade')

        const addedLabels = new Set<string>()
        commonKeys.forEach(k => {
            const std = STANDARD_MEASURES[k]
            if (!addedLabels.has(std.label.toLowerCase())) {
                // For standard 'unidade', ONLY show if we have a specific weight from DB, otherwise it's a guess (100g) which is bad professionaly
                if (k === 'unidade' && !food.fiber) return // Using fiber as a proxy for having specific weight info

                opts.push({
                    value: k,
                    label: std.label,
                    weight: std.weight,
                    fullLabel: std.label
                })
                addedLabels.add(std.label.toLowerCase())
            }
        })

        return opts
    }, [food, isLiquid])

    // Helper to get current option config
    const getOption = (val: string) => options.find(o => o.value === val) || options[0]

    // Calculate display value based on current grams and selected unit
    const displayValue = useMemo(() => {
        if (food.quantity === 0) return '0'
        const grams = Number(food.quantity)
        const opt = getOption(currentUnit)

        if (opt.weight === 1) return grams.toString()

        const val = grams / opt.weight
        // Round nicely: 2.0 -> 2, 2.5 -> 2.5, 2.333 -> 2.3
        return Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(/\.0$/, '')
    }, [food.quantity, currentUnit, options])

    const handleValueChange = (valStr: string) => {
        const opt = getOption(currentUnit)

        if (valStr === '') {
            onChange(0, currentUnit)
            return
        }

        const num = parseFloat(valStr)
        if (isNaN(num)) return

        // Convert back to grams for storage
        const grams = num * opt.weight
        onChange(grams, currentUnit)
    }

    const handleUnitChange = (newUnit: string) => {
        // When unit changes, we usually want to PRESERVE THE GRAMS
        // Example: 100g -> Switch to "Colher (25g)" -> Visual becomes "4". Grams stay 100.
        onChange(Number(food.quantity) || 0, newUnit)
    }

    // Auto-select logic improvements
    useEffect(() => {
        if ((!food.unit || food.unit === 'default')) {
            let bestUnit = isLiquid ? 'ml' : 'g'
            
            // Fallback to standard human units if no DB/Custom preferred found
            const standardHumanUnit = options.find(o => ['unidade', 'fatia', 'copo', 'xicara'].includes(o.value) && o.weight > 1)
            if (standardHumanUnit) bestUnit = standardHumanUnit.value

            // Only trigger update if we are essentially initializing (empty qty)
            if (food.quantity === 0) {
                onChange(0, bestUnit)
            }
        }
    }, [food.unit, food.quantity, isLiquid, options, onChange])

    const selectedOption = getOption(currentUnit)

    return (
        <div className="flex items-center gap-1.5 w-full bg-muted/20 hover:bg-muted/40 transition-colors rounded-lg border border-border/10 focus-within:border-primary/50 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20 group">
            {/* Numeric Input */}
            <Input
                type="number"
                value={displayValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="h-9 w-[70px] border-0 bg-transparent text-center focus-visible:ring-0 px-1 font-medium text-foreground text-sm shadow-none"
                placeholder="0"
            />

            {/* Divider */}
            <div className="h-4 w-[1px] bg-border/40" />

            {/* Unit Selector */}
            <Select value={currentUnit} onValueChange={handleUnitChange}>
                <SelectTrigger className="h-9 border-0 bg-transparent focus:ring-0 px-2 gap-1 text-muted-foreground hover:text-foreground transition-colors min-w-[70px] justify-between" >
                    <span className="truncate text-xs font-normal">
                        {selectedOption.label}
                    </span>
                </SelectTrigger>
                <SelectContent align="start" className="max-h-[220px]">
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs py-2">
                            <div className="flex items-center justify-between w-full gap-4 min-w-[120px]">
                                <span className={cn((opt.value === 'g' || opt.value === 'ml') ? "font-bold" : "")}>{opt.fullLabel}</span>
                                {opt.weight !== 1 && (
                                    <span className="text-[9px] text-muted-foreground/50 font-mono bg-muted/30 px-1.5 py-0.5 rounded">
                                        {opt.weight}g
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}