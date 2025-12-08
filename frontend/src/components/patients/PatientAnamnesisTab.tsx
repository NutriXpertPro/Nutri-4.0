"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { anamnesisService, AnamnesisTemplate } from "@/services/anamnesis-service"
import { TemplateList } from "@/components/anamnesis/TemplateList"
import { TemplateBuilder } from "@/components/anamnesis/TemplateBuilder"
import { StandardAnamnesisForm, StandardAnamnesisData } from "@/components/anamnesis/StandardAnamnesisForm"
import { Loader2 } from "lucide-react"
import { Patient } from "@/services/patient-service"

interface PatientAnamnesisTabProps {
    patientId: number
    patient?: Patient
}

type ViewState = 'LIST' | 'CREATE_TEMPLATE' | 'FILL_STANDARD' | 'FILL_CUSTOM'

export function PatientAnamnesisTab({ patientId, patient }: PatientAnamnesisTabProps) {
    const [view, setView] = useState<ViewState>('LIST')
    const [selectedTemplate, setSelectedTemplate] = useState<AnamnesisTemplate | null>(null)
    const queryClient = useQueryClient()

    // Fetch Templates
    const { data: templates, isLoading } = useQuery({
        queryKey: ['anamnesis-templates'],
        queryFn: anamnesisService.listTemplates
    })

    // Create Template Mutation
    const createTemplateMutation = useMutation({
        mutationFn: anamnesisService.createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anamnesis-templates'] })
            setView('LIST')
        }
    })

    const handleSelectTemplate = (template: AnamnesisTemplate | 'STANDARD') => {
        if (template === 'STANDARD') {
            setView('FILL_STANDARD')
        } else {
            setSelectedTemplate(template)
            setView('FILL_CUSTOM')
        }
    }

    const handleSaveTemplate = (templateData: any) => {
        createTemplateMutation.mutate(templateData)
    }

    // Fetch Standard Anamnesis
    const { data: standardAnamnesis, isLoading: isLoadingStandard } = useQuery({
        queryKey: ['anamnesis-standard', patientId],
        queryFn: () => anamnesisService.getStandardAnamnesis(patientId),
        enabled: !!patientId
    })

    const saveStandardMutation = useMutation({
        mutationFn: (data: any) => anamnesisService.saveStandardAnamnesis(patientId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anamnesis-standard', patientId] })
            setView('LIST')
            alert("Anamnese salva com sucesso!")
        },
        onError: (error) => {
            console.error("Erro ao salvar anamnese:", error)
            alert("Erro ao salvar anamnese. Tente novamente.")
        }
    })

    const handleSaveAnamnesis = async (data: any) => {
        await saveStandardMutation.mutateAsync(data)
    }

    // Pré-preencher dados iniciais do paciente no formulário ou dados salvos
    const getInitialData = (): Partial<StandardAnamnesisData> | undefined => {
        // Prioridade: Dados salvos > Dados do perfil > Undefined
        if (standardAnamnesis) {
            // Se já existe anamnese salva, retornamos os dados dela
            // Mapeamento simples assumindo que os campos batem ou são passados diretamente
            return standardAnamnesis as any
        }

        if (!patient) return undefined

        // Calcular idade
        let idade = null
        if (patient.birth_date) {
            const today = new Date()
            const birth = new Date(patient.birth_date)
            idade = today.getFullYear() - birth.getFullYear()
            const monthDiff = today.getMonth() - birth.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                idade--
            }
        }

        return {
            nome: patient.name,
            email: patient.email,
            telefone: patient.phone || "",
            sexo: patient.gender === "F" ? "Feminino" : patient.gender === "M" ? "Masculino" : "",
            nascimento: patient.birth_date || "",
            idade: idade,
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="min-h-[600px] relative">
            {view === 'LIST' && (
                <TemplateList
                    templates={templates || []}
                    onSelectTemplate={handleSelectTemplate}
                    onCreateTemplate={() => setView('CREATE_TEMPLATE')}
                />
            )}

            {view === 'CREATE_TEMPLATE' && (
                <TemplateBuilder
                    onSave={handleSaveTemplate}
                    onCancel={() => setView('LIST')}
                    isLoading={createTemplateMutation.isPending}
                />
            )}

            {view === 'FILL_STANDARD' && (
                <StandardAnamnesisForm
                    patientId={patientId}
                    onBack={() => setView('LIST')}
                    onSave={handleSaveAnamnesis}
                    initialData={getInitialData()}
                // isLoading={saveStandardMutation.isPending} // Assuming the form component accepts this prop, if not, it should be added.
                />
            )}

            {view === 'FILL_CUSTOM' && selectedTemplate && (
                <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                    <h3 className="text-lg font-medium">Anamnese: {selectedTemplate.title}</h3>
                    <p>Formulário dinâmico para {selectedTemplate.questions.length} perguntas.</p>
                    <button onClick={() => setView('LIST')} className="mt-4 underline">Voltar</button>
                    {/* TODO: Implementar formulário dinâmico para templates personalizados */}
                </div>
            )}
        </div>
    )
}


