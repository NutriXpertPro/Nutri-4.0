"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { PatientHeader } from "@/components/patients/PatientHeader"
import { PatientOverviewTab } from "@/components/patients/PatientOverviewTab"
import { PatientContextTab } from "@/components/patients/PatientContextTab"
import { PatientAnalysisTab } from "@/components/patients/PatientAnalysisTab"
import { PatientDietTab } from "@/components/patients/PatientDietTab"
import { PatientAnamnesisTab } from "@/components/patients/PatientAnamnesisTab"
import { PatientTimelineTab } from "@/components/patients/PatientTimelineTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, LayoutDashboard, ClipboardList, BarChart3, Utensils, Stethoscope, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useDietEditorStore } from "@/stores/diet-editor-store"
import { usePatientStore } from "@/stores/use-patient-store"
import { usePatient } from "@/hooks/usePatients" // Importar usePatient hook

function PatientDetailsContent() {
    const params = useParams()
    const rawId = params?.id
    const patientId = typeof rawId === 'string' ? parseInt(rawId, 10) : 0

    // --- 2. Usar React Query como Fonte de Verdade ---
    const { patient, isLoading: isPatientLoading, error } = usePatient(patientId)
    const { setActivePatient } = usePatientStore()

    const activeTab = useDietEditorStore(state => state.activeTab)
    const setActiveTab = useDietEditorStore(state => state.setActiveTab)
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab')

    React.useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam)
        } else if (!tabParam && activeTab === 'diet') {
            setActiveTab('overview')
        }
    }, [])

    // --- 3. Sincronizar dados do React Query com o Store (para compatibilidade) ---
    React.useEffect(() => {
        if (patient) {
            setActivePatient(patient)
        }
        return () => {
            setActivePatient(null)
        }
    }, [patient, setActivePatient])


    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const isLoading = isAuthLoading || isPatientLoading || patientId === 0

    const calculateAge = (birthDate?: string): number => {
        if (!birthDate) return 0
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    const patientData = patient ? {
        name: patient.name,
        email: patient.email,
        phone: patient.phone || "",
        age: patient.age || calculateAge(patient.birth_date),
        occupation: patient.goal || "Não informado",
        status: patient.status, // Booleano direto do backend
        avatar: patient.avatar,
        adesao: 85 // TODO: buscar da API
    } : undefined

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Carregando dados do paciente...</p>
                </div>
            </div>
        )
    }

    if (!isLoading && isAuthenticated && (error || !patient)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-8 text-center">
                    <CardContent>
                        <p className="text-destructive font-medium">Erro ao carregar paciente</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Não foi possível encontrar o paciente com ID {params.id}
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-full space-y-6">
            <PatientHeader patient={patientData} fullData={patient} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-10">
                <TabsList className="flex items-center gap-1 bg-muted/20 p-1.5 rounded-[1.5rem] border border-border/5 w-fit mb-8">
                    {[
                        { value: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
                        { value: 'context', label: 'Contexto', icon: ClipboardList },
                        { value: 'analysis', label: 'Análise', icon: BarChart3 },
                        { value: 'diet', label: 'Dieta', icon: Utensils },
                        { value: 'anamnesis', label: 'Anamnese', icon: Stethoscope },
                        { value: 'timeline', label: 'Timeline', icon: Calendar }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className={cn(
                                    "px-6 h-10 rounded-2xl text-[11px] font-normal uppercase tracking-widest transition-all duration-500 flex items-center gap-2",
                                    "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/10",
                                    "text-muted-foreground hover:text-foreground hover:bg-background/20"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                <div className="mt-6 space-y-6">
                    <TabsContent value="overview">
                        <PatientOverviewTab patientId={patientId} />
                    </TabsContent>

                    <TabsContent value="context">
                        <PatientContextTab patientId={patientId} />
                    </TabsContent>

                    <TabsContent value="analysis">
                        <PatientAnalysisTab patientId={patientId} />
                    </TabsContent>

                    <TabsContent value="diet">
                        <PatientDietTab patientId={patientId} />
                    </TabsContent>

                    <TabsContent value="anamnesis">
                        <PatientAnamnesisTab />
                    </TabsContent>

                    <TabsContent value="timeline">
                        <PatientTimelineTab patientId={patientId} />
                    </TabsContent>
                </div>

            </Tabs>
        </div>
    )
}

export default function PatientDetailsPage() {
    return (
        <DashboardLayout>
            <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando...</p>
                    </div>
                </div>
            }>
                <PatientDetailsContent />
            </React.Suspense>
        </DashboardLayout>
    )
}
