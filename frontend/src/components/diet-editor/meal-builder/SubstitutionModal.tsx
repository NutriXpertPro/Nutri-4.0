"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Plus } from 'lucide-react'

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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <ArrowRightLeft className="w-5 h-5 text-primary" />
                        Substituições: <span className="text-muted-foreground">{originalFoodName}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Equivalence Type Selector */}
                    <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg">
                        <span className="text-sm font-medium">Equivalência por:</span>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="equivalence"
                                    value="protein"
                                    checked={equivalenceType === 'protein'}
                                    onChange={() => setEquivalenceType('protein')}
                                    className="accent-primary"
                                />
                                <span className="text-sm">Proteína</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="equivalence"
                                    value="calories"
                                    checked={equivalenceType === 'calories'}
                                    onChange={() => setEquivalenceType('calories')}
                                    className="accent-primary"
                                />
                                <span className="text-sm">Calorias</span>
                            </label>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left">Alimento</th>
                                    <th className="p-3 text-center">Qtd</th>
                                    <th className="p-3 text-center">PTN</th>
                                    <th className="p-3 text-center">Cal</th>
                                    <th className="p-3 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {SUBSTITUTIONS.map((sub) => (
                                    <tr
                                        key={sub.id}
                                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${selectedSub === sub.id ? 'bg-primary/5' : ''}`}
                                        onClick={() => setSelectedSub(sub.id)}
                                    >
                                        <td className="p-3 font-medium">{sub.name}</td>
                                        <td className="p-3 text-center text-muted-foreground">{sub.qty}</td>
                                        <td className="p-3 text-center text-emerald-600 font-medium">{sub.ptn}</td>
                                        <td className="p-3 text-center text-amber-600 font-medium">{sub.kcal}</td>
                                        <td className="p-3 text-center">
                                            <div className={`w-4 h-4 rounded-full border border-primary flex items-center justify-center ${selectedSub === sub.id ? 'bg-primary' : 'bg-transparent'}`}>
                                                {selectedSub === sub.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button variant="secondary" className="gap-2">
                            <Plus className="w-4 h-4" /> Adicionar como Alternativa
                        </Button>
                        <Button
                            className="gap-2"
                            disabled={!selectedSub}
                            onClick={() => {
                                // Logic to substitute would go here
                                onClose()
                            }}
                        >
                            <ArrowRightLeft className="w-4 h-4" /> Substituir
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
