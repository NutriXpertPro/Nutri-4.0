"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SubstitutionModalProps {
    isOpen: boolean
    onClose: () => void
    originalFoodName: string
    onSubstitute: (newFood: any) => void
}

// Dummy Substitution Data
const SUBSTITUTIONS = [
    { id: 1, name: 'Tilápia', qty: '120g', ptn: '31g', kcal: '130kcal' },
    { id: 2, name: 'Atum lata', qty: '100g', ptn: '30g', kcal: '116kcal' },
    { id: 3, name: 'Patinho', qty: '90g', ptn: '31g', kcal: '150kcal' },
    { id: 4, name: 'Whey Isolado', qty: '40g', ptn: '32g', kcal: '150kcal' },
    { id: 5, name: 'Tofu', qty: '300g', ptn: '30g', kcal: '240kcal' },
]

export function SubstitutionModal({ isOpen, onClose, originalFoodName, onSubstitute }: SubstitutionModalProps) {
    const [equivalenceType, setEquivalenceType] = useState<'protein' | 'calories'>('protein')
    const [selectedSub, setSelectedSub] = useState<number | null>(null)

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
                                    value="calories"
                                    checked={equivalenceType === 'calories'}
                                    onChange={() => setEquivalenceType('calories')}
                                    className="accent-primary w-4 h-4"
                                />
                                <span className={cn("text-xs uppercase tracking-widest transition-colors", equivalenceType === 'calories' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>Calorias</span>
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
                                    <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-normal">kcal</th>
                                    <th className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest w-12 font-normal">Sel.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/5">
                                {SUBSTITUTIONS.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        className={cn(
                                            "hover:bg-primary/5 transition-all cursor-pointer group",
                                            selectedSub === sub.id ? 'bg-primary/10' : ''
                                        )}
                                        onClick={() => setSelectedSub(sub.id)}
                                    >
                                        <td className="p-4">
                                            <div className="text-sm text-foreground group-hover:text-primary transition-colors">{sub.name}</div>
                                            <div className="text-[9px] text-muted-foreground uppercase tracking-tighter opacity-60">Equivalência sugerida</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Badge variant="outline" className="tabular-nums bg-background/50">{sub.qty}</Badge>
                                        </td>
                                        <td className="p-4 text-center tabular-nums text-emerald-600">{sub.ptn}</td>
                                        <td className="p-4 text-center tabular-nums text-amber-600">{sub.kcal}</td>
                                        <td className="p-4 text-center">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                                                selectedSub === sub.id ? 'border-primary bg-primary shadow-lg shadow-primary/25' : 'border-border/40 bg-transparent group-hover:border-primary/40'
                                            )}>
                                                {selectedSub === sub.id && <Plus className="w-4 h-4 text-white" />}
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
                                    const selectedSubstitution = SUBSTITUTIONS.find(sub => sub.id === selectedSub);
                                    if (selectedSubstitution) {
                                        onSubstitute(selectedSubstitution);
                                    }
                                    onClose()
                                }}
                            >
                                <ArrowRightLeft className="w-4 h-4" /> Substituir Agora
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
