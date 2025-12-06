"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/layout"
import { PatientHeader } from "@/components/patients/PatientHeader"
import { PatientOverviewTab } from "@/components/patients/PatientOverviewTab"
import { PatientContextTab } from "@/components/patients/PatientContextTab"
import { PatientAnalysisTab } from "@/components/patients/PatientAnalysisTab"
import { PatientDietTab } from "@/components/patients/PatientDietTab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, FileText, PieChart, Utensils } from "lucide-react"

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
    // No futuro, fetch data usando params.id

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <PatientHeader />

                <Tabs defaultValue="overview" className="mt-8">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-muted/20 p-1 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Visão Geral</TabsTrigger>
                        <TabsTrigger
                            value="context"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Contexto</TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Análise</TabsTrigger>
                        <TabsTrigger
                            value="diet"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Dieta</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-6">
                        {/* Conteúdo das Abas (Placeholder por enquanto) */}
                        <TabsContent value="overview">
                            <PatientOverviewTab />
                        </TabsContent>

                        <TabsContent value="context">
                            <PatientContextTab />
                        </TabsContent>

                        <TabsContent value="analysis">
                            <PatientAnalysisTab />
                        </TabsContent>

                        <TabsContent value="diet">
                            <PatientDietTab />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
