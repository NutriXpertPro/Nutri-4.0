"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { WizardAnamnesisForm } from "@/components/anamnesis/WizardAnamnesisForm"
import { StandardAnamnesisForm } from "@/components/anamnesis/StandardAnamnesisForm"
import { useQuery, useMutation } from "@tanstack/react-query"
import { anamnesisService } from "@/services/anamnesis-service"
import { Loader2 } from "lucide-react"

function AnamnesisAnswerContent() {
    const searchParams = useSearchParams()
    const patientId = searchParams.get("patient") ? parseInt(searchParams.get("patient")!) : null
    const templateId = searchParams.get("template") ? parseInt(searchParams.get("template")!) : null
    const type = searchParams.get("type") as "standard" | "custom" || "custom"

    const { data: standardData, isLoading: isLoadingStandard } = useQuery({
        queryKey: ['anamnesis-standard', patientId],
        queryFn: () => patientId ? anamnesisService.getStandardAnamnesis(patientId) : null,
        enabled: !!patientId && type === "standard"
    })

    const saveStandardMutation = useMutation({
        mutationFn: (data: any) => {
            if (!patientId) throw new Error("Patient ID missing")
            return anamnesisService.saveStandardAnamnesis(patientId, data)
        },
        onSuccess: () => {
            alert("Anamnese enviada com sucesso! Obrigado.")
        },
        onError: () => {
            alert("Erro ao enviar anamnese. Tente novamente.")
        }
    })

    if (!patientId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-destructive">Link inválido: ID do paciente não encontrado.</p>
            </div>
        )
    }

    if (isLoadingStandard) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // TODO: Implement Custom Template fetching and filling logic here
    if (templateId) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <p className="text-muted-foreground">Formulários personalizados em breve.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold mb-2">Anamnese Nutricional</h1>
                    <p className="text-muted-foreground">
                        Por favor, preencha o formulário abaixo com atenção para que possamos personalizar seu plano alimentar.
                    </p>
                </div>

                {type === "standard" ? (
                    <StandardAnamnesisForm
                        patientId={patientId}
                        onBack={() => { }} // No back action needed for standalone page
                        onSave={async (data) => {
                            await saveStandardMutation.mutateAsync(data)
                        }}
                        initialData={standardData}
                        isStandalone={true} // Add this prop to StandardAnamnesisForm to hide "Voltar" button if needed
                    />
                ) : (
                    <div className="text-center">Tipo de anamnese desconhecido.</div>
                )}
            </div>
        </div>
    )
}

export default function AnamnesisAnswerPage() {
    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AnamnesisAnswerContent />
        </React.Suspense>
    )
}
