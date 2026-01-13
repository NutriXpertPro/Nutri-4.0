"use client"

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EcoHeader } from './ecosystem/hud/EcoHeader'
import { useDietEditorStore, useDietEditorPatient, PatientContext } from '@/stores/diet-editor-store'
import { DietTemplateWorkspace } from './DietTemplateWorkspace'
import { useQuery } from '@tanstack/react-query'
import patientService, { Patient } from '@/services/patient-service'
import { evaluationService } from '@/services/evaluation-service'
import { anamnesisService } from '@/services/anamnesis-service'
import api from '@/services/api'

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
    const setPatient = useDietEditorStore(state => state.setPatient)
    const calculateMetabolics = useDietEditorStore(state => state.calculateMetabolics)

    // Ensure we have a patient context or ID for the tabs
    const patientContext = patient || MOCK_PATIENT
    const patientId = String(patientContext.id)

    // Fetch complete patient data from API
    const { data: completePatient, isLoading, error } = useQuery({
        queryKey: ['patient', patientId],
        queryFn: () => patientService.getById(Number(patientId)),
        enabled: !!patientId && patientId !== '1' // Only fetch if not using mock patient
    })

    // Update the store patient with complete data when available
    useEffect(() => {
        if (completePatient && !isLoading) {
            // Fetch patient profile data to get weight, height, and other metrics
            const fetchPatientProfile = async () => {
                try {
                    // Fetch the most recent evaluation to get weight and height
                    const evaluations = await evaluationService.listByPatient(completePatient.id);
                    const latestEvaluation = evaluations.length > 0
                        ? evaluations.reduce((latest, current) =>
                            new Date(current.date) > new Date(latest.date) ? current : latest
                        )
                        : null;

                    // Fetch Anamnesis - both standard and custom responses
                    let anamnesisData = null
                    try {
                        // First, try to get standard anamnesis (more common)
                        const standardAnamnesis = await anamnesisService.getStandardAnamnesis(completePatient.id)
                        if (standardAnamnesis) {
                            anamnesisData = standardAnamnesis
                        } else {
                            // If no standard anamnesis, try to get custom responses
                            const responses = await anamnesisService.listResponses(completePatient.id)
                            if (responses && responses.length > 0) {
                                // Get most recent - prioritize filled_date
                                anamnesisData = responses.sort((a, b) => new Date(b.filled_date).getTime() - new Date(a.filled_date).getTime())[0]
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to fetch anamnesis', e)
                    }

                    // Fetch Exams
                    let examsData: any[] = []
                    try {
                        const { data } = await api.get(`/evaluations/external-exams/?patient=${completePatient.id}`)
                        examsData = data || []
                    } catch (e) {
                        console.warn('Failed to fetch exams', e)
                    }

                    // Calculate Initial Weight (First evaluation or Current if only one)
                    let initialWeight = undefined
                    if (evaluations.length > 0) {
                        const sortedByDate = [...evaluations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        initialWeight = Number(sortedByDate[0].weight)
                    }

                    const mappedPatient: PatientContext = {
                        id: completePatient.id,
                        name: completePatient.name,
                        status: completePatient.status,
                        avatar: completePatient.avatar,
                        age: completePatient.birth_date ?
                            new Date().getFullYear() - new Date(completePatient.birth_date).getFullYear() : 0,
                        sex: (completePatient.gender === 'M' || completePatient.gender === 'F') ? completePatient.gender : 'M',
                        weight: latestEvaluation?.weight ? Number(latestEvaluation.weight) : 70,
                        height: latestEvaluation?.height ? Number(latestEvaluation.height) / 100 : 1.70,
                        bodyFat: latestEvaluation?.body_fat ? Number(latestEvaluation.body_fat) : undefined,
                        muscleMass: latestEvaluation?.muscle_mass ? Number(latestEvaluation.muscle_mass) : undefined,
                        goal: completePatient.goal || '',
                        restrictions: [],
                        allergies: [],
                        initial_weight: initialWeight || (latestEvaluation?.weight ? Number(latestEvaluation.weight) : 70),
                        anamnesis: anamnesisData,
                        exams: examsData,
                        notes: [],
                        // Mapped new fields
                        birth_date: completePatient.birth_date,
                        phone: completePatient.phone,
                        email: completePatient.email,
                        start_date: completePatient.start_date,
                        created_at: completePatient.created_at,
                        service_type: completePatient.service_type,
                        // If backend doesn't support these directly yet, we leave them undefined or map from somewhere else if available
                        medications: [],
                        pathologies: []
                    }
                    setPatient(mappedPatient)

                    // Trigger recalculation of metabolic values after patient data is updated
                    setTimeout(() => {
                        calculateMetabolics()
                    }, 100) // Small delay to ensure state is updated
                } catch (error) {
                    console.error('Error fetching patient profile:', error)

                    // Fallback to basic patient data if evaluation fetch fails
                    const mappedPatient: PatientContext = {
                        id: completePatient.id,
                        name: completePatient.name,
                        status: completePatient.status,
                        avatar: completePatient.avatar,
                        age: completePatient.birth_date ?
                            new Date().getFullYear() - new Date(completePatient.birth_date).getFullYear() : 0,
                        sex: (completePatient.gender === 'M' || completePatient.gender === 'F') ? completePatient.gender : 'M',
                        weight: 70,
                        height: 1.70,
                        bodyFat: undefined,
                        muscleMass: undefined,
                        goal: completePatient.goal || '',
                        restrictions: [],
                        allergies: [],
                        initial_weight: 70,
                        anamnesis: null,
                        exams: [],
                        notes: []
                    }
                    setPatient(mappedPatient)

                    // Trigger recalculation of metabolic values after patient data is updated
                    setTimeout(() => {
                        calculateMetabolics()
                    }, 100) // Small delay to ensure state is updated
                }
            }

            fetchPatientProfile()
        }
    }, [completePatient, isLoading, setPatient, setPatient, calculateMetabolics])

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
                    className="w-full min-h-[calc(100vh-120px)] bg-background/95 backdrop-blur-sm border-b border-border/10 rounded-b-3xl shadow-2xl relative pointer-events-auto px-2 md:px-4 mt-[10px]"
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
                content = <PatientOverviewTab patientId={Number(patientId)} />
                break;
            case 'context':
                content = <PatientContextTab patientId={Number(patientId)} />
                break;
            case 'analysis':
                content = <PatientAnalysisTab patientId={Number(patientId)} />
                break;
            case 'anamnesis':
                content = <PatientAnamnesisTab patientId={Number(patientId)} patient={completePatient as any} />
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

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Erro ao carregar dados do paciente</h2>
                    <p className="text-muted-foreground mt-2">{(error as Error).message}</p>
                </div>
            </div>
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
