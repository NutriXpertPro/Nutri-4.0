"use client"

import React from 'react'
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
    const patient = useDietEditorPatient()

    // Ensure we have a patient context or ID for the tabs
    const patientContext = patient || MOCK_PATIENT
    const patientId = String(patientContext.id)

    const renderContent = () => {
        switch (activeTab) {
            case 'diet':
                // This is the Diet Editor Workspace
                // Currently placeholder, but this is where the editor lives
                return (
                    <div className="flex-1 flex items-center justify-center bg-black/5 relative grayscale opacity-50 h-full">
                        {/* Placeholder pattern */}
                        <div className="absolute inset-0 z-[-1] opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]" />
                        <p className="text-muted-foreground text-sm font-mono">Workspace de Dieta (Em Construção)</p>
                    </div>
                )

            case 'overview':
                return (
                    <div className="w-full p-6 md:p-8 bg-background/50">
                        <div className="space-y-6">
                            <PatientOverviewTab />
                        </div>
                    </div>
                )

            case 'context':
                return (
                    <div className="w-full p-6 md:p-8 bg-background/50">
                        <div className="space-y-6">
                            <PatientContextTab />
                        </div>
                    </div>
                )

            case 'analysis':
                return (
                    <div className="w-full p-6 md:p-8 bg-background/50">
                        <div className="space-y-6">
                            <PatientAnalysisTab patientId={Number(patientId)} />
                        </div>
                    </div>
                )

            case 'anamnesis':
                return (
                    <div className="w-full p-6 md:p-8 bg-background/50">
                        <div className="space-y-6">
                            <PatientAnamnesisTab patientId={Number(patientId)} patient={patientContext as any} />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative z-0 isolate flex flex-col">

            {/* AREA: HEADER (Full Width, always visible) */}
            <div className="flex-none z-50 bg-background/80 backdrop-blur-md border-b border-border/10">
                <EcoHeader />
            </div>

            {/* AREA: WORKSPACE / TABS CONTENT */}
            <div className="flex-1 relative pt-12">
                {renderContent()}
            </div>

        </div>
    )
}
