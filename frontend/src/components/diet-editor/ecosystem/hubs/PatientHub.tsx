"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Clock,
    FileText,
    History,
    ChevronRight,
    Activity,
    Calendar,
    ArrowRight
} from 'lucide-react'
import { GlassPanel } from '../design/GlassPrimitives'
import { useDietEditorStore, useDietEditorPatient } from '@/stores/diet-editor-store'
import { Button } from '@/components/ui/button'

const tabs = [
    { id: 'bio', label: 'Bio', icon: UserIcon },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'exams', label: 'Exames', icon: Activity },
    { id: 'gallery', label: 'Galeria', icon: ImageIcon },
]

// Mock Icons
function UserIcon(props: any) { return <div {...props}><FileText size={16} /></div> }
function ImageIcon(props: any) { return <div {...props}><FileText size={16} /></div> }

export function PatientHub() {
    const [activeTab, setActiveTab] = useState('bio')
    const patient = useDietEditorPatient()

    return (
        <div className="h-full flex flex-col p-4 overflow-hidden">
            {/* Hub Title */}
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Patient Intelligence
                </h3>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[70px] transition-all border ${isActive
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:bg-slate-800'
                                }`}
                        >
                            <Icon className="mb-1 h-4 w-4" />
                            <span className="text-[10px] uppercase font-medium">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <AnimatePresence mode="popLayout">
                    {activeTab === 'bio' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <GlassPanel className="p-4">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-orange-400" />
                                    Última Consulta
                                </h4>
                                <p className="text-xs text-slate-400">12 dias atrás (25 Out)</p>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded">Peso -2kg</span>
                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Massa +500g</span>
                                </div>
                            </GlassPanel>

                            <GlassPanel className="p-4 border-l-2 border-l-red-500">
                                <h4 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wide">Restrições</h4>
                                <div className="flex flex-wrap gap-2">
                                    {patient?.restrictions?.map(r => (
                                        <span key={r} className="text-[10px] bg-red-900/30 text-red-300 px-2 py-1 rounded border border-red-900/50">
                                            {r}
                                        </span>
                                    )) || <span className="text-xs text-slate-500">Nenhuma restrição</span>}
                                </div>
                            </GlassPanel>

                            <GlassPanel className="p-4 border-l-2 border-l-orange-500">
                                <h4 className="text-xs font-bold text-orange-400 mb-2 uppercase tracking-wide">Alergias</h4>
                                <div className="flex flex-wrap gap-2">
                                    {patient?.allergies?.map(a => (
                                        <span key={a} className="text-[10px] bg-orange-900/30 text-orange-300 px-2 py-1 rounded border border-orange-900/50">
                                            {a}
                                        </span>
                                    )) || <span className="text-xs text-slate-500">Nenhuma alergia</span>}
                                </div>
                            </GlassPanel>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <GlassPanel key={i} className="p-3 hover:bg-white/5 cursor-pointer group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-mono text-slate-400">25/10/2023</span>
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 rounded">Low Carb</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-300">Plano Hipertrofia B</span>
                                            <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                    </GlassPanel>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Link to Full Profile */}
            <Button variant="ghost" className="w-full mt-4 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20">
                Ver Perfil Completo <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
        </div>
    )
}
