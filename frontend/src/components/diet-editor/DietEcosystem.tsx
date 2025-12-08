"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EcoHeader } from './ecosystem/hud/EcoHeader'
import { useDietEditorStore, useDietEditorPatient } from '@/stores/diet-editor-store'

// Import Patient Tabs Components
import { PatientOverviewTab } from "@/components/patients/PatientOverviewTab"
import { PatientContextTab } from "@/components/patients/PatientContextTab"
import { PatientAnalysisTab } from "@/components/patients/PatientAnalysisTab"
import { PatientDietTab } from "@/components/patients/PatientDietTab"
import { PatientAnamnesisTab } from "@/components/patients/PatientAnamnesisTab"

// Mock if patient is missing
const MOCK_PATIENT = { id: 1, name: 'Paciente Exemplo' }

export function DietEcosystem() {
    const activeTab = useDietEditorStore(state => state.activeTab)
    const setActiveTab = useDietEditorStore(state => state.setActiveTab)
    const patient = useDietEditorPatient()

    // Ensure we have a patient context or ID for the tabs
    const patientContext = patient || MOCK_PATIENT
    const patientId = String(patientContext.id)

    // Animações para o efeito de gaveta "saindo do móvel"
    const contentVariants = {
        initial: { y: "-100%", opacity: 1, zIndex: 20 },
        animate: { y: 0, opacity: 1, zIndex: 20 },
        exit: { y: "-100%", opacity: 1, zIndex: 20 },
        transition: { type: "spring" as const, bounce: 0, duration: 0.5 }
    };

    // Backdrop animation
    const backdropVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 }
    }

    const renderContent = () => {
        let content = null;

        switch (activeTab) {
            case 'diet':
                content = (
                    <motion.div
                        key="diet-drawer"
                        {...contentVariants}
                        className="w-full h-[50vh] bg-background/50 flex items-center justify-center relative rounded-b-3xl shadow-2xl border-b border-border/10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 z-[-1] opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]" />
                        <p className="text-muted-foreground text-sm font-mono">Workspace de Dieta (Em Construção)</p>
                    </motion.div>
                )
                break;
            case 'overview':
                content = (
                    <motion.div
                        key="overview-drawer"
                        {...contentVariants}
                        className="w-full bg-background/95 backdrop-blur-sm p-6 md:p-8 rounded-b-3xl shadow-2xl border-b border-border/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            <PatientOverviewTab />
                        </div>
                    </motion.div>
                )
                break;
            case 'context':
                content = (
                    <motion.div
                        key="context-drawer"
                        {...contentVariants}
                        className="w-full bg-background/95 backdrop-blur-sm p-6 md:p-8 rounded-b-3xl shadow-2xl border-b border-border/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            <PatientContextTab />
                        </div>
                    </motion.div>
                )
                break;
            case 'analysis':
                content = (
                    <motion.div
                        key="analysis-drawer"
                        {...contentVariants}
                        className="w-full bg-background/95 backdrop-blur-sm p-6 md:p-8 rounded-b-3xl shadow-2xl border-b border-border/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            <PatientAnalysisTab patientId={Number(patientId)} />
                        </div>
                    </motion.div>
                )
                break;
            case 'anamnesis':
                content = (
                    <motion.div
                        key="anamnesis-drawer"
                        {...contentVariants}
                        className="w-full bg-background/95 backdrop-blur-sm p-6 md:p-8 rounded-b-3xl shadow-2xl border-b border-border/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            <PatientAnamnesisTab patientId={Number(patientId)} patient={patientContext as any} />
                        </div>
                    </motion.div>
                )
                break;
            default:
                return null
        }

        return (
            <>
                {/* Backdrop - Click to Close */}
                <motion.div
                    key="backdrop"
                    {...backdropVariants}
                    className="absolute inset-0 z-10 bg-black/5 cursor-pointer"
                    onClick={() => setActiveTab('')}
                />
                {/* Drawer Content */}
                <div className="relative z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        {content}
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative z-0 isolate flex flex-col">

            {/* AREA: HEADER (Full Width, always visible) */}
            <div className="flex-none z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
                <EcoHeader />
            </div>

            {/* AREA: WORKSPACE / TABS CONTENT */}
            <div className="flex-1 relative pt-12 overflow-hidden">
                <AnimatePresence mode="wait">
                    {activeTab && renderContent()}
                </AnimatePresence>
            </div>

        </div>
    )
}
