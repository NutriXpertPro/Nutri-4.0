"use client"

export const dynamic = 'force-dynamic'

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { WizardAnamnesisForm } from "@/components/anamnesis/WizardAnamnesisForm"
import { StandardAnamnesisForm } from "@/components/anamnesis/StandardAnamnesisForm"
import { useQuery, useMutation } from "@tanstack/react-query"
import { anamnesisService } from "@/services/anamnesis-service"
import { Loader2 } from "lucide-react"

function AnamnesisAnswerContent() {
    const searchParams = useSearchParams()

    const patientParam = searchParams.get("patient")
    const templateParam = searchParams.get("template")
    const typeParam = searchParams.get("type")

    const patientId = patientParam ? parseInt(patientParam, 10) : null
    const templateId = templateParam ? parseInt(templateParam, 10) : null
    const type = (typeParam as "standard" | "custom") || "custom"

    const { data: standardData, isLoading: isLoadingStandard } = useQuery({
        queryKey: ['anamnesis-standard', patientId],
        queryFn: () => (patientId ? anamnesisService.getStandardAnamnesis(patientId) : null),
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
        onError: (error: any) => {
            console.error("Anamnesis save error:", error)
            const serverErrors = error.response?.data
            const url = error.config?.url
            const baseURL = error.config?.baseURL
            const method = error.config?.method?.toUpperCase()

            let message = "Erro ao enviar anamnese. Tente novamente."

            if (serverErrors) {
                const details = Object.entries(serverErrors)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
                    .join("\n")
                message += `\n\nDetalhes do Erro:\n${details}`
            }

            message += `\n\n--- Diagnóstico de Rede ---`
            message += `\nURL: ${url}`
            message += `\nBaseURL: ${baseURL}`
            message += `\nMétodo: ${method}`
            message += `\nStatus: ${error.response?.status || 'Sem resposta'}`

            alert(message)
        }
    })

    if (!patientId && typeof window !== 'undefined') {
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
                        patientId={patientId || 0}
                        onBack={() => { }}
                        onSave={async (data) => {
                            await saveStandardMutation.mutateAsync(data)
                        }}
                        initialData={standardData}
                        isStandalone={true}
                    />
                ) : (
                    <div className="text-center p-8 text-muted-foreground">
                        Tipo de anamnese não suportado ou ID do paciente ausente.
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AnamnesisAnswerPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <AnamnesisAnswerContent />
        </Suspense>
    )
}
