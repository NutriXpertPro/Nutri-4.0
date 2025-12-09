"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ExpressSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    onApplyTemplate: (templateName: string, items: any[]) => void
    mealTitle: string
}

// Dummy Templates Data
const STANDARD_TEMPLATES = [
    { id: 'normo', label: 'Normocalórica', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
    { id: 'lowcarb', label: 'Low Carb', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { id: 'highcarb', label: 'High Carb', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { id: 'keto', label: 'Cetogênica', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { id: 'veg', label: 'Vegetariana', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { id: 'vegan', label: 'Vegana', color: 'bg-green-600/10 text-green-700 border-green-300' },
    { id: 'bulk', label: 'Hipercalórica', color: 'bg-red-500/10 text-red-600 border-red-200' },
]

const SAVED_TEMPLATES = [
    { id: 1, name: 'Café Clássico (Ovo+Pão+Queijo)', kcal: 320, items: [] },
    { id: 2, name: 'Café Fit (Tapioca+Whey)', kcal: 280, items: [] },
    { id: 3, name: 'Café Low Carb (Ovos+Abacate)', kcal: 350, items: [] },
]

export function ExpressSelectorModal({ isOpen, onClose, onApplyTemplate, mealTitle }: ExpressSelectorModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>☀️</span> {mealTitle} - Escolha Template
                    </DialogTitle>
                    <DialogDescription>
                        Selecione um padrão dietético ou um template salvo para aplicar nesta refeição.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Standard Templates Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {STANDARD_TEMPLATES.map((tmpl) => (
                            <button
                                key={tmpl.id}
                                className={`p-4 rounded-lg border flex items-center justify-center text-sm font-medium transition-all hover:scale-105 active:scale-95 ${tmpl.color}`}
                                onClick={() => onApplyTemplate(tmpl.label, [])}
                            >
                                {tmpl.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Saved Templates List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Templates Salvos</h4>
                        <div className="h-[200px] pr-4 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                {SAVED_TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
                                        onClick={() => onApplyTemplate(tmpl.name, tmpl.items)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-sm font-medium">{tmpl.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="text-xs">{tmpl.kcal} kcal</Badge>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs opacity-0 group-hover:opacity-100">
                                                Aplicar
                                            </Button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
