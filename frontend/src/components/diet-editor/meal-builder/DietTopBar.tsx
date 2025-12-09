"use client"

import React from 'react'
import { useDietEditorStore } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { Copy, Eye, Settings, Star } from 'lucide-react'
import { cn } from "@/lib/utils"

const DAYS = [
    { id: 'Seg', label: 'Seg' },
    { id: 'Ter', label: 'Ter' },
    { id: 'Qua', label: 'Qua' },
    { id: 'Qui', label: 'Qui' },
    { id: 'Sex', label: 'Sex' },
    { id: 'Sab', label: 'Sáb' },
    { id: 'Dom', label: 'Dom' },
]

export function DietTopBar() {
    const {
        activeWorkspaceDay,
        setActiveWorkspaceDay,
        favorites
    } = useDietEditorStore()

    return (
        <div className="bg-card border-b border-border shadow-sm">
            <div className="p-2 flex flex-col gap-2">

                {/* Unified Toolbar */}
                <div className="flex items-center justify-between gap-4">

                    {/* 1. Week Days Selector */}
                    <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border/50">
                        {DAYS.map((day) => (
                            <button
                                key={day.id}
                                onClick={() => setActiveWorkspaceDay(day.id)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-semibold rounded-md transition-all",
                                    activeWorkspaceDay === day.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {day.id}
                            </button>
                        ))}
                    </div>

                    {/* 2. Actions (Right Aligned) */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-medium">
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copiar Dia</span>
                        </Button>
                        <Button variant="secondary" size="sm" className="h-8 gap-2 text-xs font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                        </Button>
                    </div>
                </div>

                {/* 3. Favorites Quick Bar */}
                <div className="flex items-center gap-3 pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5 min-w-max text-xs font-bold text-amber-500/90 mx-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        FAVORITOS
                    </div>

                    <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar py-1">
                        {favorites.length === 0 ? (
                            <span className="text-[10px] text-muted-foreground/60 italic px-2">
                                Seus alimentos favoritos aparecerão aqui para acesso rápido.
                            </span>
                        ) : (
                            favorites.map((fav) => (
                                <button
                                    key={fav.id}
                                    className="flex items-center gap-1.5 bg-background border border-border hover:border-amber-400/50 hover:bg-amber-500/5 px-2.5 py-1 rounded-full text-xs transition-all group whitespace-nowrap"
                                    title={`Adicionar ${fav.nome}`}
                                >
                                    <span className="text-base leading-none">{getFoodIcon(fav.grupo)}</span>
                                    <span className="max-w-[120px] truncate font-medium text-muted-foreground group-hover:text-foreground">{fav.nome}</span>
                                </button>
                            ))
                        )}
                    </div>

                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto flex-shrink-0 opacity-50 hover:opacity-100" title="Configurar Favoritos">
                        <Settings className="w-3.5 h-3.5" />
                    </Button>
                </div>

            </div>
        </div>
    )
}

function getFoodIcon(group: string): string {
    if (!group) return '🍽️'
    const g = group.toLowerCase()
    if (g.includes('carne') || g.includes('ave') || g.includes('peixe')) return '🥩'
    if (g.includes('leite') || g.includes('queijo') || g.includes('iogurte')) return '🥛'
    if (g.includes('ovo')) return '🥚'
    if (g.includes('legume') || g.includes('verdura')) return '🥦'
    if (g.includes('fruta')) return '🍎'
    if (g.includes('cereal') || g.includes('pão') || g.includes('arroz')) return '🍞'
    if (g.includes('óleo') || g.includes('gordura')) return '🥑'
    if (g.includes('açúcar') || g.includes('doce')) return '🍬'
    return '🍽️'
}
