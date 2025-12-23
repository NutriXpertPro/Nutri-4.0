"use client"

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    ClipboardList,
    BarChart3,
    Utensils,
    Stethoscope,
    LucideIcon
} from 'lucide-react'
import { useDietEditorStore } from '@/stores/diet-editor-store'
import { cn } from '@/lib/utils'

interface NavOption {
    id: string
    label: string
    icon: LucideIcon
    shortcut: string
}

const NAVIGATION_OPTIONS: NavOption[] = [
    { id: 'diet', label: 'Dieta', icon: Utensils, shortcut: '1' },
    { id: 'context', label: 'Contexto', icon: ClipboardList, shortcut: '2' },
    { id: 'analysis', label: 'Análise', icon: BarChart3, shortcut: '3' },
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, shortcut: '4' },
    { id: 'anamnesis', label: 'Anamnese', icon: Stethoscope, shortcut: '5' },
]

export function HubNavigation() {
    const activeTab = useDietEditorStore(state => state.activeTab)
    const setActiveTab = useDietEditorStore(state => state.setActiveTab)

    const currentTabId = activeTab || 'diet'

    const handleSelect = (id: string) => {
        // Se clicar na aba 'diet' e ela já for a atual, não faz nada
        // Se clicar em outra aba já ativa, desativa (mostra dieta)
        if (id === 'diet') {
            setActiveTab('')
        } else {
            setActiveTab(id === activeTab ? '' : id)
        }
    }

    // Keyboard Shortcuts (Ctrl + 1-5)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
                e.preventDefault()
                const index = parseInt(e.key) - 1
                if (index >= 0 && index < NAVIGATION_OPTIONS.length) {
                    handleSelect(NAVIGATION_OPTIONS[index].id)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeTab])

    return (
        <div className="w-full flex justify-center px-4 md:px-10">
            <nav className="w-full max-w-[1600px] flex items-center justify-between p-1.5 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden px-4 md:px-8">
                {/* Magnetic/Sliding Background */}
                <div className="flex items-center gap-1 relative z-10 w-full justify-between">
                    {NAVIGATION_OPTIONS.map((option) => {
                        const isActive = currentTabId === option.id
                        const Icon = option.icon

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={cn(
                                    "relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-tab-bg"
                                        className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <Icon className={cn(
                                    "h-4 w-4 transition-transform duration-300",
                                    isActive ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                )} />

                                <span className={cn(
                                    "text-[11px] uppercase tracking-wider transition-all",
                                    isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                )}>
                                    {option.label}
                                </span>

                                {/* Shortcut Hint (Visible on Hover) */}
                                <span className="absolute -top-1 -right-1 text-[8px] bg-background border border-border px-1 rounded opacity-0 group-hover:opacity-40 transition-opacity">
                                    {option.shortcut}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </div >
    )
}
