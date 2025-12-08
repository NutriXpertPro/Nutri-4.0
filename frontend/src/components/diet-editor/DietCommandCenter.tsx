"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Save,
    Undo2,
    Redo2,
    FileText,
    Keyboard,
    Sparkles,
    Search,
    LayoutGrid,
    Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDietEditorStore } from '@/stores/diet-editor-store'

// Components
import { PatientContextPanel } from './patient-context/PatientContextPanel'
import { MetabolicCalculatorPanel } from './calculator/MetabolicCalculatorPanel'
import { MealBuilder } from './meal-builder/MealBuilder'
import { NutritionPanel } from './food-search/NutritionPanel'
import { AnalyticsBar } from './analytics/AnalyticsBar'
import { MealPresetsPanel } from './presets/MealPresetsPanel'
import { PDFPreviewModal } from './pdf/PDFPreviewModal'

interface DietCommandCenterProps {
    patientId?: number
}

export function DietCommandCenter({ patientId }: DietCommandCenterProps) {
    const [rightPanelTab, setRightPanelTab] = useState<'search' | 'presets'>('search')
    const [showPDFPreview, setShowPDFPreview] = useState(false)

    const {
        leftPanelCollapsed,
        rightPanelCollapsed,
        toggleLeftPanel,
        toggleRightPanel,
        isDirty,
        undo,
        redo,
        historyIndex,
        history,
    } = useDietEditorStore()

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault()
                console.log('Save diet')
            }
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                undo()
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'z') {
                e.preventDefault()
                redo()
            }
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault()
                setShowPDFPreview(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [undo, redo])

    return (
        <>
            <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
                {/* Toolbar */}
                <header className="h-14 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Diet Command Center
                        </h1>
                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                            PRO
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Undo/Redo */}
                        <div className="flex items-center gap-1 mr-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={undo}
                                disabled={historyIndex < 0}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white disabled:opacity-30"
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white disabled:opacity-30"
                            >
                                <Redo2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* AI Button (placeholder) */}
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="gap-2 text-slate-500 cursor-not-allowed"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span className="text-xs">IA (Em breve)</span>
                        </Button>

                        {/* Keyboard shortcuts */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                        >
                            <Keyboard className="h-4 w-4" />
                        </Button>

                        {/* PDF Preview */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPDFPreview(true)}
                            className="gap-2 text-slate-300 hover:text-white"
                        >
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Preview PDF</span>
                        </Button>

                        {/* Save Button */}
                        <Button
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                        >
                            <Save className="h-4 w-4" />
                            <span>Salvar</span>
                            {isDirty && (
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                        </Button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Patient Context */}
                    <motion.aside
                        initial={false}
                        animate={{ width: leftPanelCollapsed ? 48 : 320 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-r border-white/10 bg-black/20 backdrop-blur-xl flex flex-col relative flex-shrink-0"
                    >
                        <button
                            onClick={toggleLeftPanel}
                            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-slate-700 border border-white/20 flex items-center justify-center hover:bg-slate-600 transition-colors"
                        >
                            {leftPanelCollapsed ? (
                                <ChevronRight className="h-3 w-3" />
                            ) : (
                                <ChevronLeft className="h-3 w-3" />
                            )}
                        </button>

                        {!leftPanelCollapsed && (
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <PatientContextPanel />
                                <MetabolicCalculatorPanel />
                            </div>
                        )}
                    </motion.aside>

                    {/* Center - Meal Builder */}
                    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6">
                            <MealBuilder />
                        </div>
                        <AnalyticsBar />
                    </main>

                    {/* Right Panel - Food Search & Presets */}
                    <motion.aside
                        initial={false}
                        animate={{ width: rightPanelCollapsed ? 48 : 380 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-l border-white/10 bg-black/20 backdrop-blur-xl flex flex-col relative flex-shrink-0"
                    >
                        <button
                            onClick={toggleRightPanel}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-slate-700 border border-white/20 flex items-center justify-center hover:bg-slate-600 transition-colors"
                        >
                            {rightPanelCollapsed ? (
                                <ChevronLeft className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </button>

                        {!rightPanelCollapsed && (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Tab Switcher */}
                                <div className="flex border-b border-white/10">
                                    <button
                                        onClick={() => setRightPanelTab('search')}
                                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'search'
                                                ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/10'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <Search className="h-4 w-4" />
                                        Buscar
                                    </button>
                                    <button
                                        onClick={() => setRightPanelTab('presets')}
                                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${rightPanelTab === 'presets'
                                                ? 'text-white border-b-2 border-indigo-500 bg-indigo-500/10'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                        Presets
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {rightPanelTab === 'search' ? (
                                        <NutritionPanel />
                                    ) : (
                                        <MealPresetsPanel />
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.aside>
                </div>
            </div>

            {/* PDF Preview Modal */}
            <PDFPreviewModal
                open={showPDFPreview}
                onOpenChange={setShowPDFPreview}
            />
        </>
    )
}
