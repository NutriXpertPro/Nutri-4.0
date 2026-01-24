"use client"

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, Plus, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { substitutionService, type SubstitutionOption, type SubstitutionResponse } from '@/services/substitution-service'

interface SubstitutionModalProps {
    isOpen: boolean
    onClose: () => void
    originalFoodName: string
    mealId: number
    foodItemId: number
    onSubstitute: (newFood: any) => void
}

export function SubstitutionModal({ isOpen, onClose, originalFoodName, mealId, foodItemId, onSubstitute }: SubstitutionModalProps) {
    const [equivalenceType, setEquivalenceType] = useState<'protein' | 'carbs' | 'fat'>('protein')
    const [selectedSub, setSelectedSub] = useState<SubstitutionOption | null>(null)
    const [substitutions, setSubstitutions] = useState<SubstitutionOption[]>([])
    const [originalMacros, setOriginalMacros] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && mealId && foodItemId) {
            loadSubstitutions()
        }
    }, [isOpen, mealId, foodItemId])

    async function loadSubstitutions() {
        setLoading(true)
        setError(null)
        try {
            const response = await substitutionService.getSubstitutes(mealId, foodItemId)
            setSubstitutions(response.substitutions)
            setOriginalMacros(response.original_food.macros)
            
            // Determinar tipo de equivalência baseado no macronutriente predominante
            if (response.substitutions.length > 0) {
                setEquivalenceType(response.substitutions[0].predominant_nutrient as 'protein' | 'carbs' | 'fat')
            }
        } catch (err: any) {
            console.error('Erro ao carregar substituições:', err)
            setError('Erro ao carregar substituições. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    function getMacrosLabel(): string {
        switch (equivalenceType) {
            case 'protein': return 'Proteína'
            case 'carbs': return 'Carboidrato'
            case 'fat': return 'Gordura'
            default: return 'Macronutriente'
        }
    }

    function getMacrosValue(sub: SubstitutionOption, key: 'protein' | 'carbs' | 'fat'): string {
        return `${sub.macros[key]}g`
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-background/80 backdrop-blur-2xl">
                <DialogHeader className="p-8 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl tracking-tight">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <ArrowRightLeft className="w-5 h-5 text-primary" />
                        </div>
                        Substituições: <span className="text-muted-foreground/60">{originalFoodName}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="px-8 space-y-6 pb-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-3 text-muted-foreground">Carregando substituições...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            {error}
                            <Button variant="outline" className="mt-4" onClick={loadSubstitutions}>
                                Tentar novamente
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Equivalence Type Selector */}
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/10">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Equivalência baseada em:</span>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="equivalence"
                                            value="protein"
                                            checked={equivalenceType === 'protein'}
                                            onChange={() => setEquivalenceType('protein')}
                                            className="accent-primary w-4 h-4"
                                        />
                                        <span className={cn("text-xs uppercase tracking-widest transition-colors", equivalenceType === 'protein' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>Proteína</span>
                                    </label>
                                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="equivalence"
                                            value="carbs"
                                            checked={equivalenceType === 'carbs'}
                                            onChange={() => setEquivalenceType('carbs')}
                                            className="accent-primary w-4 h-4"
                                        />
                                        <span className={cn("text-xs uppercase tracking-widest transition-colors", equivalenceType === 'carbs' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>Carboidrato</span>
                                    </label>
                                    <label className="flex items-center space-x-2.5 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="equivalence"
                                            value="fat"
                                            checked={equivalenceType === 'fat'}
                                            onChange={() => setEquivalenceType('fat')}
                                            className="accent-primary w-4 h-4"
                                        />
                                        <span className={cn("text-xs uppercase tracking-widest transition-colors", equivalenceType === 'fat' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>Gordura</span>
                                    </label>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="border border-border/10 rounded-3xl overflow-hidden shadow-sm bg-background/50">
                                <table className="w-full">
                                    <thead className="bg-muted/50 border-b border-border/10">
                                        <tr className="font-normal border-b border-border/10 text-muted-foreground uppercase">
                                            <th className="p-4 text-left text-[10px] text-muted-foreground uppercase tracking-widest font-normal">Alimento Sugerido</th>
                                            <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-normal">Qtd</th>
                                            <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-normal">PTN</th>
                                            <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-normal">CHO</th>
                                            <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-normal">kcal</th>
                                            <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest w-12 font-normal">Sel.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/5">
                                        {substitutions.map((sub) => (
                                            <tr
                                                key={sub.substitute_food_id}
                                                className={cn(
                                                    "hover:bg-primary/5 transition-all cursor-pointer group",
                                                    selectedSub?.substitute_food_id === sub.substitute_food_id ? 'bg-primary/10' : ''
                                                )}
                                                onClick={() => setSelectedSub(sub)}
                                            >
                                                <td className="p-4">
                                                    <div className="text-sm text-foreground group-hover:text-primary transition-colors">{sub.substitute_food_name}</div>
                                                    <div className="text-[9px] text-muted-foreground uppercase tracking-tighter opacity-60">{sub.substitute_source}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <Badge variant="outline" className="tabular-nums bg-background/50">{sub.equivalent_quantity_display}</Badge>
                                                </td>
                                                <td className="p-4 text-center tabular-nums text-emerald-600">{getMacrosValue(sub, 'protein')}</td>
                                                <td className="p-4 text-center tabular-nums text-blue-600">{getMacrosValue(sub, 'carbs')}</td>
                                                <td className="p-4 text-center tabular-nums text-amber-600">{sub.macros.calories}</td>
                                                <td className="p-4 text-center">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                                                        selectedSub?.substitute_food_id === sub.substitute_food_id ? 'border-primary bg-primary shadow-lg shadow-primary/25' : 'border-border/40 bg-transparent group-hover:border-primary/40'
                                                    )}>
                                                        {selectedSub?.substitute_food_id === sub.substitute_food_id && <Plus className="w-4 h-4 text-white" />}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-between items-center pt-4 border-t border-border/5">
                                <Button variant="ghost" className="rounded-xl text-[10px] uppercase tracking-widest" onClick={onClose}>Cancelar</Button>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="rounded-xl text-[10px] uppercase tracking-widest gap-2 h-11 px-6 border-border/40 hover:bg-muted/30">
                                        <Plus className="w-4 h-4" /> Alternativa
                                    </Button>
                                    <Button
                                        className="rounded-xl text-[10px] uppercase tracking-widest gap-2 h-11 px-8 shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                                        disabled={!selectedSub}
                                        onClick={() => {
                                            if (selectedSub) {
                                                onSubstitute({
                                                    name: selectedSub.substitute_food_name,
                                                    quantity: selectedSub.equivalent_quantity_g,
                                                    unit: 'g',
                                                    calories: selectedSub.macros.calories,
                                                    protein: selectedSub.macros.protein,
                                                    carbs: selectedSub.macros.carbs,
                                                    fats: selectedSub.macros.fat,
                                                    fiber: selectedSub.macros.fiber,
                                                    source: selectedSub.substitute_source,
                                                    food_id: selectedSub.substitute_food_id,
                                                })
                                            }
                                            onClose()
                                        }}
                                    >
                                        <ArrowRightLeft className="w-4 h-4" /> Substituir Agora
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
