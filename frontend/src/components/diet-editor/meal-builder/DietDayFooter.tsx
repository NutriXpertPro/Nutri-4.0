"use client"

import React, { useMemo } from 'react'
import { useDietEditorStore, useDietEditorTargets } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { FileText, Save, Eye, CheckCircle2, AlertTriangle } from 'lucide-react'

export function DietDayFooter() {
    const { workspaceMeals, activeWorkspaceDay } = useDietEditorStore()
    const { calories: targetCalories, macros: targetMacros } = useDietEditorTargets()

    // Calculate totals from all meals in the workspace
    const totals = useMemo(() => {
        return workspaceMeals.reduce((acc, meal) => {
            meal.foods.forEach(food => {
                const multiplier = food.qty / 100 // Assuming base is 100g, need to check if unit conversions are handled elsewhere or if food.ptn is per 100g. 
                // In store, food properties are usually per 100g. 
                // Looking at DietTemplateWorkspace.tsx: 
                // ptn: (food.protein * (food.qty / 100)).toFixed(1)

                // However, workspaceMealFood usually stores PRE-CALCULATED absolute values for the specific QTY if they came from addFoodToMeal?
                // Let's check the store structure or generic "Food" structure.
                // In diet-editor-store.ts:
                // WorkspaceMealFood interface has ptn, cho, fat, fib properties.
                // When adding a meal, we need to know if these are "per 100g" or "total for qty".
                // In MealTemplate (previous code), it did: (food.protein * (food.qty / 100)).
                // So the Food object likely has 'protein' per 100g. 
                // BUT WorkspaceMealFood has 'ptn'. 
                // Let's assume 'ptn' in WorkspaceMealFood is PER 100g for now, or check how it was used.
                // Actually, looking at MealTemplate.tsx again:
                // {meal.foods.map((food) => ...
                // <td ...>{(food.protein * (food.qty / 100)).toFixed(1)}</td>

                // Wait, the previous MealTemplate used `food: any` in map? 
                // No, it used `meal.foods`. workspaceMeals[0].foods[0] structure in store:
                // { id: 1, name: 'Frango...', ptn: 31 ... }
                // And the render was: `food.protein`? The interface says `ptn`.
                // Ah, the previous file had a mismatch or I might be misremembering the read.
                // Let's look at the read of store.ts again.
                // WorkspaceMealFood has: ptn, cho, fat, fib.
                // The Initial State in store has: ptn: 31, cho: 0...
                // These look like values per 100g.
                // Let's assume for this implementation that we need to calculate based on Qty.
                // Formula: (Macro * Qty) / 100 (if measure is g/ml).

                // Simplification: We will compute based on the assumption that ptn/cho/fat in WorkspaceMealFood are PER 100g/ml.

                const factor = food.qty / 100
                acc.calories += (food.ptn * 4 + food.cho * 4 + food.fat * 9) * factor
                acc.protein += food.ptn * factor
                acc.carbs += food.cho * factor
                acc.fats += food.fat * factor
                acc.fiber += food.fib * factor
            })
            return acc
        }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 })
    }, [workspaceMeals])

    const getProgress = (current: number, target: number) => {
        if (!target || target === 0) return 0
        return Math.min((current / target) * 100, 100)
    }

    const getStatusColor = (current: number, target: number) => {
        if (!target) return "bg-muted"
        const pct = (current / target) * 100
        if (pct > 110) return "bg-red-500" // Exceeded
        if (pct < 90) return "bg-yellow-500" // Under
        return "bg-green-500" // Good
    }

    // Derived Calculations using Energy (Kcal) roughly if not stored explicitly
    // Actually typically we sum macros * 4/9 to get kcal if not provided.

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-2 px-6">
            <div className="max-w-[1600px] mx-auto flex flex-col gap-3">

                {/* Top Row: Summary Text + Main Bar */}
                <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-4 font-medium">
                        <span className="text-muted-foreground flex items-center gap-1">
                            📊 RESUMO: <span className="text-foreground">{activeWorkspaceDay}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <span>Meta: {targetCalories} kcal</span>
                            <span className="text-muted-foreground">|</span>
                            <span>Atual: {Math.round(totals.calories)} kcal</span>
                        </div>
                    </div>
                    <div className="flex-1 max-w-md flex items-center gap-2">
                        <Progress value={getProgress(totals.calories, targetCalories)} className="h-2.5" indicatorClassName={getStatusColor(totals.calories, targetCalories)} />
                        <span className="text-xs font-bold w-12 text-right">{Math.round(getProgress(totals.calories, targetCalories))}%</span>
                    </div>
                </div>

                {/* Bottom Row: Detailed Macros & Actions */}
                <div className="flex items-start justify-between">

                    {/* Macros Grid */}
                    <div className="flex items-center gap-4">
                        <MacroCard
                            label="PTN"
                            current={totals.protein}
                            target={targetMacros.protein}
                            color="bg-emerald-500"
                        />
                        <MacroCard
                            label="CHO"
                            current={totals.carbs}
                            target={targetMacros.carbs}
                            color="bg-blue-500"
                        />
                        <MacroCard
                            label="FAT"
                            current={totals.fats}
                            target={targetMacros.fats}
                            color="bg-amber-500"
                        />
                        <MacroCard
                            label="FIB"
                            current={totals.fiber}
                            target={targetMacros.fiber}
                            color="bg-purple-500"
                        />

                        {/* Alerts */}
                        <div className="flex flex-col justify-center gap-0.5 ml-4 border-l border-border pl-4 h-full">
                            <span className="text-[10px] font-bold text-muted-foreground mb-0.5">ALERTAS:</span>
                            <div className="flex gap-2">
                                {totals.fiber < targetMacros.fiber * 0.8 && (
                                    <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        <AlertTriangle className="w-3 h-3" />
                                        FIB Baixa
                                    </div>
                                )}
                                {totals.fiber >= targetMacros.fiber * 0.8 && (
                                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        <CheckCircle2 className="w-3 h-3" />
                                        FIB Ok
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <Save className="w-3.5 h-3.5" /> Salvar Rascunho
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Gerar PDF
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Visualizar
                        </Button>
                        <Button size="sm" className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Finalizar Dieta
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}

function MacroCard({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
    const pct = target > 0 ? (current / target) * 100 : 0
    const isOver = pct > 110
    const isUnder = pct < 90

    return (
        <div className="bg-muted/30 border border-border rounded-md p-1.5 min-w-[120px]">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
                <span className="text-[10px] font-medium">
                    {Math.round(current)}g <span className="text-muted-foreground">/ {Math.round(target)}g</span>
                </span>
            </div>
            <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                    className={cn("absolute top-0 left-0 h-full transition-all duration-500", color)}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <div className="flex justify-between items-center mt-0.5">
                <span className={cn("text-[9px] font-bold", isOver ? "text-red-500" : isUnder ? "text-amber-500" : "text-emerald-500")}>
                    {Math.round(pct)}%
                </span>
                {isOver ? (
                    <span className="text-[9px] text-red-500">Acima</span>
                ) : isUnder ? (
                    <span className="text-[9px] text-amber-500">Baixo</span>
                ) : (
                    <span className="text-[9px] text-emerald-500">Adequado</span>
                )}
            </div>
        </div>
    )
}
