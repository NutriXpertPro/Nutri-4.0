"use client"

import React, { useMemo } from 'react'
import { useDietEditorStore, useDietEditorTargets } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { FileText, Save, Eye, CheckCircle2, AlertTriangle } from 'lucide-react'

export function DietDayFooter() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-header border-t border-border/30 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300">
            <div className="max-w-[1600px] mx-auto p-4 px-8 flex justify-end items-center">
                {/* Actions - Only Buttons Remaining */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 px-5 border-border/40 hover:bg-muted/30">
                        <Save className="w-4 h-4 text-muted-foreground" /> Salvar Rascunho
                    </Button>
                    <Button variant="outline" size="sm" className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 px-5 border-border/40 hover:bg-muted/30">
                        <FileText className="w-4 h-4 text-muted-foreground" /> Gerar PDF
                    </Button>
                    <Button size="sm" className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 px-6 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 transition-all">
                        <CheckCircle2 className="w-4 h-4" /> Finalizar Dieta
                    </Button>
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
        <div className="bg-background/40 border border-border/10 rounded-2xl p-2.5 min-w-[140px] shadow-sm group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-center mb-1.5 px-0.5">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
                <span className="text-[11px] font-black tabular-nums">
                    {Math.round(current)}g <span className="text-[9px] text-muted-foreground/50">/ {Math.round(target)}g</span>
                </span>
            </div>
            <div className="relative h-2 w-full bg-muted/40 rounded-full overflow-hidden shadow-inner mb-1.5">
                <div
                    className={cn("absolute top-0 left-0 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]", color)}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <div className="flex justify-between items-center px-0.5">
                <span className={cn("text-[10px] font-black tabular-nums", isOver ? "text-red-500" : isUnder ? "text-amber-500" : "text-emerald-500")}>
                    {Math.round(pct)}%
                </span>
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                    isOver ? "bg-red-500/10 text-red-500" :
                        isUnder ? "bg-amber-500/10 text-amber-500" :
                            "bg-emerald-500/10 text-emerald-500")}>
                    {isOver ? "Acima" : isUnder ? "Baixo" : "Meta"}
                </span>
            </div>
        </div>
    )
}
