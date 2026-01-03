"use client"

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { WorkspaceMealFood } from '@/stores/diet-editor-store'
import { Ruler, Scale, Utensils } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SmartQuantitySelectorProps {
    food: WorkspaceMealFood
    onChange: (grams: number, measure: string) => void
    inputRef?: React.RefObject<HTMLInputElement>
    onEnter?: () => void
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

export function SmartQuantitySelector({ food, onChange, inputRef, onEnter }: SmartQuantitySelectorProps) {

    // Simple heuristic to check if food is liquid (based on name or group if available)
    const isLiquid = useMemo(() => {
        const name = food.name.toLowerCase()
        const prep = food.prep?.toLowerCase() || ''
        const keywords = ['suco', 'leite', 'água', 'agua', 'refrigerante', 'chá', 'cha', 'café', 'cafe', 'vitamina', 'caldo', 'sopa', 'iogurte', 'bebida', 'vinho', 'cerveja']
        return keywords.some(k => name.includes(k) || prep.includes(k))
    }, [food.name, food.prep])

    // Current measure used for display logic
    // We try to deduce if the current grams match a specific measure cleanly, otherwise default to grams
    // But we also need to respect what was last selected by user if stored.
    // For now, let's treat 'food.measure' as the persistent selected unit.

    // We default to 'g' if no measure is set
    const currentUnit = food.measure && food.measure !== 'default' ? food.measure : (isLiquid ? 'ml' : 'g')

    // Compute available options
    const options = useMemo(() => {
        const opts = []

        // Base unit: g or ml
        if (isLiquid) {
            opts.push({ value: 'ml', label: 'ml', weight: 1, fullLabel: 'Mililitros (ml)' })
        } else {
            opts.push({ value: 'g', label: 'g', weight: 1, fullLabel: 'Gramas (g)' })
        }

        // 1. Specific Measures from Database (highest priority)
        const addedLabels = new Set<string>()

        if (food.medidas && food.medidas.length > 0) {
            food.medidas.forEach((m, idx) => {
                const label = m.label
                // Avoid redundant 'ml' or 'g' entries from DB if they match base
                if (label.toLowerCase() === 'ml' || label.toLowerCase() === 'g') return

                if (!addedLabels.has(label.toLowerCase())) {
                    opts.push({
                        value: `custom_${idx}`,
                        label: label,
                        weight: m.weight,
                        fullLabel: label
                    })
                    addedLabels.add(label.toLowerCase())
                }
            })
        }

        // 2. Single Unidade Caseira from Database
        if (food.unidade_caseira && food.peso_unidade_caseira_g) {
            const label = food.unidade_caseira
            if (!addedLabels.has(label.toLowerCase()) && label.toLowerCase() !== 'g' && label.toLowerCase() !== 'ml') {
                opts.push({
                    value: 'db_measure', // generic ID for the main measure
                    label: label,
                    weight: food.peso_unidade_caseira_g,
                    fullLabel: label
                })
                addedLabels.add(label.toLowerCase())
            }
        }

        // 3. Fallbacks (Standard Measures)
        // Only add if relevant. E.g., 'Fatia' for liquids makes no sense.
        const commonKeys = ['col_sopa', 'col_cha', 'xicara', 'copo']
        if (!isLiquid) commonKeys.push('fatia', 'unidade')

        commonKeys.forEach(k => {
            const std = STANDARD_MEASURES[k]
            if (!addedLabels.has(std.label.toLowerCase())) {
                // For standard 'unidade', ONLY show if we have a specific weight from DB, otherwise it's a guess (100g) which is bad professionaly
                if (k === 'unidade' && !food.peso_unidade_caseira_g) return

                // For liquids, ensure Copo/Xicara use standard liquid weights or DB weights
                // We rely on standard weights if no specific override

                opts.push({
                    value: k,
                    label: std.label,
                    weight: std.weight,
                    fullLabel: std.label
                })
            }
        })

        return opts
    }, [food, isLiquid])

    // Helper to get current option config
    const getOption = (val: string) => options.find(o => o.value === val) || options[0]

    // Calculate display value based on current grams and selected unit
    const displayValue = useMemo(() => {
        if (food.qty === '' || food.qty === 0) return ''
        const grams = Number(food.qty)
        const opt = getOption(currentUnit)

        if (opt.weight === 1) return grams.toString()

        const val = grams / opt.weight
        // Round nicely: 2.0 -> 2, 2.5 -> 2.5, 2.333 -> 2.3
        return Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(/\.0$/, '')
    }, [food.qty, currentUnit, options])

    // Helper: Determine the best "human" unit based on priority hierarchy
    const getPreferredUnit = () => {
        // 1. Comprehensive Priority Hierarchy for "Smart Default"
        const priorityKeywords = [
            'unidade',                  // Absolute winner (Egg, Apple)
            'fatia',                    // Bread, Cheese, Cake (Usually preferred over gram/piece)
            'copo', 'xícara', 'xicara', // Liquids, Grains (Volume)
            'bife', 'filé', 'posta',    // Meats (Portion)
            'colher de sopa',           // Scoops (Rice, Beans, Powder)
            'lata', 'garrafa',          // Containers
            'concha', 'escumadeira'     // Utensils
        ]

        // Function to find an option matching a keyword
        const findOption = (keyword: string) => {
            return options.find(o =>
                (o.value === 'db_measure' || o.value.startsWith('custom_') || ['col_sopa', 'col_cha', 'xicara', 'copo', 'fatia', 'unidade'].includes(o.value)) &&
                o.label.toLowerCase().includes(keyword)
            )
        }

        let foundPriority = null
        for (const keyword of priorityKeywords) {
            foundPriority = findOption(keyword)
            if (foundPriority) break
        }

        // Fallback: If no specific priority found, check for ANY DB measure (first one)
        const dbMeasureAny = options.find(o => o.value === 'db_measure' || o.value.startsWith('custom_'))

        if (foundPriority) return foundPriority.value
        if (dbMeasureAny) return dbMeasureAny.value

        return null
    }

    const handleValueChange = (valStr: string) => {
        const opt = getOption(currentUnit)

        if (valStr === '') {
            onChange(0, currentUnit)
            return
        }

        const num = parseFloat(valStr)
        if (isNaN(num)) return

        // SMART HEURISTIC: Auto-switch to base unit (g/ml) for high values
        // If current unit is NOT base (g/ml), check thresholds:
        // - Heavy units (>40g like Cup, Slice, Unit): Threshold 6 (e.g. nobody eats 7 Cups or 7 Slices usually, they likely mean grams/ml)
        // - Light units (<=40g like Nut, Grape): Threshold 60 (e.g. 60 nuts is plausible, but 100 usually means grams)
        if (currentUnit !== 'g' && currentUnit !== 'ml') {
            const isHeavyUnit = opt.weight > 40
            const threshold = isHeavyUnit ? 7 : 60

            if (num >= threshold) {
                const baseUnit = isLiquid ? 'ml' : 'g'
                onChange(num, baseUnit)
                return
            }
        }
        // REVERSE SMART HEURISTIC: Auto-switch back to Preferred Unit for low values
        // If user deleted "00" from "200ml" to type "2", they likely mean "2 Cups" again.
        else if (currentUnit === 'g' || currentUnit === 'ml') {
            const preferredUnitValue = getPreferredUnit()
            const preferredUnit = options.find(o => o.value === preferredUnitValue)

            if (preferredUnit && preferredUnit.value !== currentUnit) {
                // Only switch if the value is very small and plausible for the unit
                if (num <= 4 && preferredUnit.weight > 1) { // Adjusted logic: check weight > 1 to avoid confusion
                    // Also ensure we don't switch if the 'preferred' is basically grams (unlikely but safe)
                    // Additional safety: if preferred is "Unit (100g)" and user types "4", "4 Units" = 400g. "4 g" = 4g. Huge diff.
                    // The logic is: User meant "4 Units". 
                    // Threshold check:
                    if (preferredUnit.weight > 40) { // Keep "Heavy" check for safety
                        onChange(num, preferredUnit.value)
                        return
                    }
                }
            }
        }

        // Convert back to grams for storage
        const grams = num * opt.weight
        onChange(grams, currentUnit)
    }

    const handleUnitChange = (newUnit: string) => {
        // When unit changes, we usually want to PRESERVE THE GRAMS
        // Example: 100g -> Switch to "Colher (25g)" -> Visual becomes "4". Grams stay 100.
        onChange(Number(food.qty) || 0, newUnit)
    }

    // Auto-select logic improvements
    useEffect(() => {
        if ((!food.measure || food.measure === 'default')) {
            let bestUnit = isLiquid ? 'ml' : 'g'
            const preferred = getPreferredUnit()

            if (preferred) {
                bestUnit = preferred
            } else {
                // Fallback to standard human units if no DB/Custom preferred found
                const standardHumanUnit = options.find(o => ['unidade', 'fatia', 'copo', 'xicara'].includes(o.value) && o.weight > 1)
                if (standardHumanUnit) bestUnit = standardHumanUnit.value
            }

            // Only trigger update if we are essentially initializing (empty qty)
            if (food.qty === '' || food.qty === 0) {
                onChange(0, bestUnit)
            }
        }
    }, [food.measure, food.qty, isLiquid, options, onChange])

    const selectedOption = getOption(currentUnit)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault() // Prevent form submission if inside a form
            onEnter?.()
        }
    }

    return (
        <div className="flex items-center gap-1.5 w-full bg-muted/20 hover:bg-muted/40 transition-colors rounded-lg border border-border/10 focus-within:border-primary/50 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20 group">
            {/* Numeric Input */}
            <Input
                ref={inputRef}
                type="number"
                value={displayValue}
                onChange={(e) => handleValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-9 w-[70px] border-0 bg-transparent text-center focus-visible:ring-0 px-1 font-medium text-foreground text-sm shadow-none"
                placeholder="0"
            />

            {/* Divider */}
            <div className="h-4 w-[1px] bg-border/40" />

            {/* Unit Selector */}
            <Select value={currentUnit} onValueChange={handleUnitChange}>
                <SelectTrigger className="h-9 border-0 bg-transparent focus:ring-0 px-2 gap-1 text-muted-foreground hover:text-foreground transition-colors min-w-[70px] justify-between" onKeyDown={handleKeyDown}>
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
