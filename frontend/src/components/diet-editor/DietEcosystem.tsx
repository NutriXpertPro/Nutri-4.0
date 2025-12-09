"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EcoHeader } from './ecosystem/hud/EcoHeader'
import { useDietEditorStore, useDietEditorPatient } from '@/stores/diet-editor-store'
import { DietTemplateWorkspace } from './DietTemplateWorkspace'

// Import Patient Tabs Components
import { PatientOverviewTab } from "@/components/patients/PatientOverviewTab"
import { PatientContextTab } from "@/components/patients/PatientContextTab"
import { PatientAnalysisTab } from "@/components/patients/PatientAnalysisTab"
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

    // Shared Drawer Animation Variants
    // Both the Diet Template and the Tabs use this "Drawer from Ceiling" effect
    const drawerVariants = {
        initial: { y: "-100%", opacity: 1, zIndex: 20 },
        animate: { y: 0, opacity: 1, zIndex: 20 },
        exit: { y: "-100%", opacity: 1, zIndex: 20 },
        transition: { type: "spring" as const, bounce: 0, duration: 0.5 }
    };

    const renderContent = () => {
        // If no tab is active, show the Diet Template Workspace
        if (!activeTab || activeTab === 'diet') {
            return (
                <motion.div
                    key="diet-template-workspace"
                    {...drawerVariants}
                    className="w-full min-h-[calc(100vh-120px)] bg-background/95 backdrop-blur-sm border-b border-border/10 rounded-b-3xl shadow-2xl relative pointer-events-auto px-2 md:px-4 mt-[30px]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ zIndex: 10 }}
                >
                    <DietTemplateWorkspace />
                </motion.div>
            )
        }

        // Otherwise, render the active tab drawer
        let content = null;
        switch (activeTab) {
            case 'overview':
                content = <PatientOverviewTab />
                break;
            case 'context':
                content = <PatientContextTab />
                break;
            case 'analysis':
                content = <PatientAnalysisTab patientId={Number(patientId)} />
                break;
            case 'anamnesis':
                content = <PatientAnamnesisTab patientId={Number(patientId)} patient={patientContext as any} />
                break;
            default:
                return null
        }

        return (
            <motion.div
                key="active-tab-content"
                {...drawerVariants}
                className="w-full bg-background/95 backdrop-blur-sm p-6 md:p-8 rounded-b-3xl shadow-2xl border-b border-border/10 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="space-y-6 mt-3">
                    {content}
                </div>
            </motion.div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative z-0 isolate flex flex-col">

            {/* AREA: HEADER (Full Width, always visible) */}
            <div className="flex-none z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
                <EcoHeader />
            </div>

            {/* AREA: WORKSPACE / TABS CONTENT */}
            <div className="flex-1 relative overflow-y-auto">
                {/* Backdrop Layer */}
                <AnimatePresence>
                    {activeTab && activeTab !== 'diet' && (
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-10 bg-black/10 cursor-pointer backdrop-blur-[2px]"
                            onClick={() => setActiveTab('')} // Closing tab returns to Diet Template
                        />
                    )}
                </AnimatePresence>

                {/* Content Drawer Area */}
                <div className="relative z-20 pointer-events-none">
                    {/* Use pointer-events-auto on children to allow interaction */}
                    <AnimatePresence mode="popLayout" initial={false}>
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    )
}
