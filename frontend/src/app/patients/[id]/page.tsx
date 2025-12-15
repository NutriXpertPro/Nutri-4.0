"use client"

import * as React from "react"
import { useParams } from "next/navigation"
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
import { Loader2 } from "lucide-react"
import { usePatient } from "@/hooks/usePatients"
import { useAuth } from "@/contexts/auth-context"

export default function PatientDetailsPage() {
    // Usar useParams hook - mais confiável para client components
    const params = useParams()

    // Proteção robusta: params.id pode ser string, string[] ou undefined
    const rawId = params?.id
    const patientId = typeof rawId === 'string' ? parseInt(rawId, 10) : 0

    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const { patient, isLoading: isPatientLoading, error } = usePatient(patientId)

    // Loading combinado: auth + patient + validação do ID
    const isLoading = isAuthLoading || isPatientLoading || patientId === 0





    // Calcular idade a partir da data de nascimento
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

    // Montar objeto do paciente para o header
    const patientData = patient ? {
        name: patient.name,
        email: patient.email,
        phone: patient.phone || "",
        age: calculateAge(patient.birth_date),
        occupation: patient.goal || "Não informado",
        status: patient.status ? "active" as const : "inactive" as const,
        adesao: 85 // TODO: buscar da API
    } : undefined

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando dados do paciente...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Erro real: apenas quando autenticado, não está loading, e houve erro ou não encontrou
    if (!isLoading && isAuthenticated && (error || !patient)) {
        return (
            <DashboardLayout>
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
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="w-full max-w-full space-y-6">
                <PatientHeader patient={patientData} fullData={patient} />

                <Tabs defaultValue="overview" className="mt-8">
                    <TabsList className="grid w-full grid-cols-5 bg-muted/20 p-1 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Visão Geral</TabsTrigger>
                        <TabsTrigger
                            value="context"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Contexto</TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Análise</TabsTrigger>
                        <TabsTrigger
                            value="diet"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Dieta</TabsTrigger>
                        <TabsTrigger
                            value="anamnesis"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Anamnese</TabsTrigger>
                        <TabsTrigger
                            value="timeline"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Timeline</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-6">
                        <TabsContent value="overview">
                            <PatientOverviewTab />
                        </TabsContent>

                        <TabsContent value="context">
                            <PatientContextTab />
                        </TabsContent>

                        <TabsContent value="analysis">
                            <PatientAnalysisTab patientId={patientId} />
                        </TabsContent>

                        <TabsContent value="diet">
                            <PatientDietTab />
                        </TabsContent>

                        <TabsContent value="anamnesis">
                            <PatientAnamnesisTab patientId={patientId} patient={patient} />
                        </TabsContent>

                        <TabsContent value="timeline">
                            <PatientTimelineTab patientId={patientId} />
                        </TabsContent>
                    </div>

                </Tabs>
            </div>
        </DashboardLayout>
    )
}

