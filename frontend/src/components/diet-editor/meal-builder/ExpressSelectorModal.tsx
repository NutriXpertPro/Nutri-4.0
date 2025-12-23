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
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

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
            <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-background/80 backdrop-blur-2xl">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="flex items-center gap-3 text-2xl tracking-tight">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                        </div>
                        {mealTitle} — <span className="text-primary">Escolha Template</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground/60 uppercase tracking-widest pt-2">
                        Selecione um padrão dietético ou um template salvo para aplicar nesta refeição.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 space-y-8">
                    {/* Standard Templates Grid */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] px-1">Padrões Dietéticos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {STANDARD_TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.id}
                                    className={cn(
                                        "p-5 rounded-[1.5rem] border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-sm group",
                                        tmpl.id === 'normo' && "bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10",
                                        tmpl.id === 'lowcarb' && "bg-blue-500/5 text-blue-600 border-blue-500/20 hover:bg-blue-500/10",
                                        tmpl.id === 'highcarb' && "bg-orange-500/5 text-orange-600 border-orange-500/20 hover:bg-orange-500/10",
                                        tmpl.id === 'keto' && "bg-purple-500/5 text-purple-600 border-purple-500/20 hover:bg-purple-500/10",
                                        tmpl.id === 'veg' && "bg-green-500/5 text-green-600 border-green-500/20 hover:bg-green-500/10",
                                        tmpl.id === 'vegan' && "bg-green-600/5 text-green-700 border-green-600/20 hover:bg-green-600/10",
                                        tmpl.id === 'bulk' && "bg-red-500/5 text-red-600 border-red-500/20 hover:bg-red-500/10",
                                    )}
                                    onClick={() => onApplyTemplate(tmpl.label, [])}
                                >
                                    <span className="text-xs uppercase tracking-widest">{tmpl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-border/10" />

                    {/* Saved Templates List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Templates Salvos pelo Nutricionista</h4>
                            <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg">Gerenciar</Button>
                        </div>
                        <div className="max-h-[280px] pr-2 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 gap-3">
                                {SAVED_TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/10 bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group shadow-sm"
                                        onClick={() => onApplyTemplate(tmpl.name, tmpl.items)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">🥞</div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{tmpl.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-tight opacity-60">Frequente no plano alimentar</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm tabular-nums">{tmpl.kcal}</span>
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">kcal total</span>
                                            </div>
                                            <Badge variant="outline" className="h-8 px-4 rounded-xl text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all bg-primary/10 text-primary border-primary/20">
                                                Aplicar
                                            </Badge>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border/5 flex justify-end gap-3">
                    <Button variant="ghost" className="rounded-xl text-[10px] uppercase tracking-widest" onClick={onClose}>Fechar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
