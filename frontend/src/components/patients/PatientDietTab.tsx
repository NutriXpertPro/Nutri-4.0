"use client"

import React, { useState } from "react"
import Link from "next/link"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Share2, Download, ChevronRight, Plus, Loader2, FileText } from "lucide-react"
import { PatientDietPDFView } from "./PatientDietPDFView"
import { DietPaperTemplate } from "./DietPaperTemplate"
import { useQuery } from "@tanstack/react-query"
import dietService from "@/services/diet-service"
import { usePatient } from "@/hooks/usePatients"

interface PatientDietTabProps {
    patientId: number
}

export function PatientDietTab({ patientId }: PatientDietTabProps) {
    const [showPDFPreview, setShowPDFPreview] = useState(false);

    // 1. Buscar Dieta Real
    const { data: diet, isLoading: isDietLoading } = useQuery({
        queryKey: ['patient-diet', patientId],
        queryFn: () => dietService.getActiveByPatient(patientId),
        enabled: !!patientId
    })

    // 2. Dados do Paciente para o PDF
    const { patient } = usePatient(patientId)

    if (isDietLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                <p className="text-sm text-muted-foreground animate-pulse font-normal">Buscando plano alimentar...</p>
            </div>
        )
    }

    // Se não houver dieta, mostrar estado vazio
    if (!diet) {
        return (
            <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center shadow-none bg-transparent">
                <Utensils className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Nenhum plano alimentar ativo</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-8 font-normal">
                    Este paciente ainda não possui uma dieta cadastrada ou ativa no sistema.
                </p>
                <Button className="gap-2 h-11 px-6 rounded-2xl text-xs font-normal uppercase tracking-widest shadow-xl shadow-primary/20" asChild>
                    <Link href={`/diets/create?patientId=${patientId}`}>
                        <Plus className="w-4 h-4" />
                        Criar Plano Alimentar
                    </Link>
                </Button>
            </Card>
        )
    }

    // Adaptar dados para o PDF
    const dietDataForPDF = {
        patientName: patient?.name || "Paciente",
        patientAge: patient?.age || 0,
        patientGoal: diet.goal || "Não definido",
        dietName: diet.name,
        dietType: diet.diet_type,
        targetCalories: diet.target_calories,
        targetProtein: Number(diet.target_protein),
        targetCarbs: Number(diet.target_carbs),
        targetFats: Number(diet.target_fats),
        meals: diet.meals_rel.map(m => ({
            name: m.name,
            time: m.time.substring(0, 5),
            items: m.items.map(i => ({
                name: i.food_name,
                quantity: `${i.quantity}${i.unit}`,
                calories: Number(i.calories),
                protein: Number(i.protein),
                carbs: Number(i.carbs),
                fats: Number(i.fats)
            }))
        }))
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <p className="text-[10px] font-normal text-primary uppercase tracking-[0.2em] mb-1">Prescrição Atual</p>
                    <h3 className="text-2xl font-normal tracking-tight text-foreground flex items-center gap-3">
                        {diet.name}
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-normal uppercase tracking-widest px-3">
                            {diet.diet_type}
                        </Badge>
                    </h3>
                </div>
                <div className="flex gap-2">
                    {diet.pdf_file ? (
                        <Button
                            variant="outline"
                            className="h-10 px-5 rounded-xl border-border/10 text-[10px] font-normal uppercase tracking-widest gap-2 hover:bg-muted/50"
                            onClick={() => window.open(diet.pdf_file, '_blank')}
                        >
                            <FileText className="h-3.5 w-3.5 text-emerald-500" />
                            Abrir Arquivo Original
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="h-10 px-5 rounded-xl border-border/10 text-[10px] font-normal uppercase tracking-widest gap-2 hover:bg-muted/50"
                            onClick={() => setShowPDFPreview(true)}
                        >
                            <Download className="h-3.5 w-3.5" />
                            Gerar PDF
                        </Button>
                    )}
                    <Button
                        className="h-10 px-5 rounded-xl text-[10px] font-normal uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                        asChild
                    >
                        <Link href={`/diets/create?patientId=${patientId}`}>
                            <Plus className="h-3.5 w-3.5" />
                            Editar Dieta
                        </Link>
                    </Button>
                </div>
            </div>

            {showPDFPreview && (
                <PatientDietPDFView
                    dietData={dietDataForPDF}
                    onClose={() => setShowPDFPreview(false)}
                />
            )}

            {/* VISUALIZAÇÃO EM PAPEL (TEMPLATE) */}
            <div className="w-full max-w-[210mm] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-border/10">
                <DietPaperTemplate dietData={dietDataForPDF} />
            </div>

            <div className="flex justify-center mt-6">
                <Button variant="ghost" className="h-14 rounded-2xl border border-dashed border-border/10 hover:bg-primary/5 text-[11px] font-normal uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                    Ver lista completa de substituições <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}