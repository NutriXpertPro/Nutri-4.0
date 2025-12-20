"use client"

import React from 'react'
import { useDietEditorStore } from '@/stores/diet-editor-store'
import { Button } from "@/components/ui/button"
import { Settings, Star } from 'lucide-react'
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
        <div className="glass-header sticky top-0 z-30 border-b border-border/50 shadow-sm backdrop-blur-md">
            <div className="px-6 py-2 flex flex-col gap-3">

                {/* Unified Toolbar */}
                <div className="flex items-center justify-between gap-4">
                </div>

                {/* 3. Favorites Quick Bar */}
                <div className="flex items-center gap-4 pt-2 border-t border-border/5">
                    <div className="flex items-center gap-2 min-w-max text-[10px] font-black text-amber-500/80 mx-1 uppercase tracking-widest">
                        <Star className="w-4 h-4 fill-amber-500/20" />
                        Favoritos
                    </div>

                    <div className="flex items-center gap-2.5 flex-1 overflow-x-auto no-scrollbar py-1">
                        {favorites.length === 0 ? (
                            <span className="text-[10px] font-bold text-muted-foreground/40 italic px-2">
                                Seus alimentos favoritos aparecerão aqui para acesso rápido.
                            </span>
                        ) : (
                            favorites.map((fav) => (
                                <button
                                    key={fav.id}
                                    className="flex items-center gap-2 bg-background/50 border border-border/20 hover:border-amber-500/40 hover:bg-amber-500/5 px-3.5 py-1.5 rounded-xl text-[11px] transition-all group whitespace-nowrap shadow-sm"
                                    title={`Adicionar ${fav.nome}`}
                                >
                                    <span className="text-lg leading-none transform group-hover:scale-125 transition-transform">{getFoodIcon(fav.grupo)}</span>
                                    <span className="max-w-[140px] truncate font-bold text-muted-foreground group-hover:text-foreground">{fav.nome}</span>
                                </button>
                            ))
                        )}
                    </div>
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