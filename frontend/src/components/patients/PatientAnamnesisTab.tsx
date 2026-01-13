"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { anamnesisService, AnamnesisTemplate } from "@/services/anamnesis-service"
import { TemplateList } from "@/components/anamnesis/TemplateList"
import { TemplateBuilder } from "@/components/anamnesis/TemplateBuilder"
import { StandardAnamnesisForm, StandardAnamnesisData } from "@/components/anamnesis/StandardAnamnesisForm"
import {
    Loader2,
    Send,
    ChevronLeft,
    FileText,
    Activity,
    Moon,
    Heart,
    Ruler,
    Camera,
    TrendingUp,
    Target,
    Dumbbell,
    Flame,
    X,
    ChevronDown,
    ChevronRight,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Download,
    User
} from "lucide-react"
import { AnamnesisShareDialog } from "@/components/patients/AnamnesisShareDialog"
import { AnamnesisReportView } from "@/components/anamnesis/AnamnesisReportView"
import { Patient } from "@/services/patient-service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDietEditorStore } from "@/stores/diet-editor-store"
import { cn } from "@/lib/utils"

interface PatientAnamnesisTabProps {
    patientId: number
    patient?: Patient
}

type ViewState = 'LIST' | 'CREATE_TEMPLATE' | 'FILL_STANDARD' | 'FILL_CUSTOM' | 'VIEW_RESPONSES'

export function PatientAnamnesisTab({ patientId, patient }: PatientAnamnesisTabProps) {
    // Função para calcular idade com base na data de nascimento
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

    const formatTime = (time?: string) => {
        if (!time) return "--"
        return time.split(':').slice(0, 2).join(':')
    }

    const formatNumber = (num?: string | number) => {
        if (!num) return "--"
        return String(Number(num))
    }

    // Obter o modo de visualização da anamnese do store
    const anamnesisViewMode = useDietEditorStore(state => state.anamnesisViewMode)

    // Converter o modo de visualização para o estado ViewState
    const getInitialView = (): ViewState => {
        // Se houver um modo explícito no store, usamos ele
        if (anamnesisViewMode && anamnesisViewMode !== 'list') {
            switch (anamnesisViewMode) {
                case 'view-responses': return 'VIEW_RESPONSES'
                case 'fill-standard': return 'FILL_STANDARD'
                case 'fill-custom': return 'FILL_CUSTOM'
            }
        }
        return 'LIST'
    }

    const [view, setView] = useState<ViewState>(getInitialView())
    const [selectedTemplate, setSelectedTemplate] = useState<AnamnesisTemplate | null>(null)
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [currentAngle, setCurrentAngle] = useState(0)
    const queryClient = useQueryClient()

    // Atualizar a view quando o anamnesisViewMode mudar
    useEffect(() => {
        const handleViewModeChange = () => {
            switch (anamnesisViewMode) {
                case 'view-responses':
                    setView('VIEW_RESPONSES');
                    break;
                case 'fill-standard':
                    setView('FILL_STANDARD');
                    break;
                case 'fill-custom':
                    setView('FILL_CUSTOM');
                    break;
                default:
                    setView('LIST');
                    break;
            }
        };

        handleViewModeChange();
    }, [anamnesisViewMode]);


    // Fetch Templates
    const { data: templates, isLoading } = useQuery({
        queryKey: ['anamnesis-templates'],
        queryFn: anamnesisService.listTemplates
    })


    // Fetch Custom Anamnesis Responses for viewing
    const { data: customResponses, isLoading: isLoadingCustom } = useQuery({
        queryKey: ['anamnesis-responses', patientId],
        queryFn: () => anamnesisService.listResponses(patientId),
        enabled: !!patientId && view === 'VIEW_RESPONSES'
    })

    const { data: evolutionData } = useQuery({
        queryKey: ['anamnesis-evolution', patientId],
        queryFn: () => anamnesisService.getEvolution(patientId),
        enabled: !!patientId && view === 'VIEW_RESPONSES'
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
    const { data: standardAnamnesis, isLoading: isLoadingStandardAnamnesis } = useQuery({
        queryKey: ['anamnesis-standard', patientId],
        queryFn: () => anamnesisService.getStandardAnamnesis(patientId),
        enabled: !!patientId
    })

    // Efeito para atualizar a view quando o anamnesisViewMode mudar externamente (pelo store)
    // Isso é importante para navegação via links externos ou abas
    useEffect(() => {
        if (anamnesisViewMode === 'view-responses') {
            setView('VIEW_RESPONSES')
        } else if (anamnesisViewMode === 'fill-standard') {
            setView('FILL_STANDARD')
        } else if (anamnesisViewMode === 'fill-custom') {
            setView('FILL_CUSTOM')
        }
        // Nota: Não forçamos 'LIST' aqui para não atrapalhar a navegação interna se o modo for apenas 'list' (default)
    }, [anamnesisViewMode]);

    const saveStandardMutation = useMutation({
        mutationFn: (data: any) => anamnesisService.saveStandardAnamnesis(patientId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['anamnesis-standard', patientId] })
            queryClient.invalidateQueries({ queryKey: ['anamnesis-evolution', patientId] })
            setView('VIEW_RESPONSES')
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

        return {
            nome: patient.name,
            email: patient.email,
            telefone: patient.phone || "",
            sexo: patient.gender === "F" ? "Feminino" : patient.gender === "M" ? "Masculino" : "",
            nascimento: patient.birth_date || "",
            idade: calculateAge(patient.birth_date),
        }
    }

    // ETAPA 2: Unificação da Fonte de Dados
    // Criamos uma fonte da verdade para a UI, unindo os dados ricos do `patient`
    // com os dados potencialmente mais recentes (em edição) do `standardAnamnesis`.
    const anamnesisData = {
        ...(patient?.anamnesis?.answers || {}),
        ...(standardAnamnesis || {}),
        nome: standardAnamnesis?.nome || patient?.name,
        email: standardAnamnesis?.email || patient?.email,
        objetivo: standardAnamnesis?.objetivo || patient?.goal,
        idade: standardAnamnesis?.idade || calculateAge(patient?.birth_date),
    }

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="min-h-[600px] relative">
            {/* Exibir informações do paciente */}

            <AnamnesisShareDialog
                open={isShareOpen}
                onOpenChange={setIsShareOpen}
                patientId={patientId}
                patientName={patient?.name || "Paciente"}
                patientEmail={patient?.email}
                templates={templates || []}
            />

            {view === 'LIST' && (
                <div className="space-y-6">
                    <div className="flex justify-end mb-2">
                        <Button onClick={() => setIsShareOpen(true)} variant="outline" className="gap-2 border-dashed">
                            <Send className="h-4 w-4" />
                            Enviar Link da Anamnese
                        </Button>
                    </div>
                    <TemplateList
                        templates={templates || []}
                        onSelectTemplate={handleSelectTemplate}
                        onCreateTemplate={() => setView('CREATE_TEMPLATE')}
                    />
                </div>
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

            {view === 'VIEW_RESPONSES' && (
                <div className="max-w-5xl mx-auto py-4 px-2 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="flex justify-start mb-6 no-print">
                        <Button
                            variant="ghost"
                            onClick={() => setView('LIST')}
                            className="group hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-full px-6"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Ver todos os modelos
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setView('FILL_STANDARD')}
                                className="rounded-full px-6 border-dashed hover:bg-primary hover:text-white transition-all"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Respostas
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsShareOpen(true)}
                                className="rounded-full px-6 border-dashed"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Enviar para Paciente
                            </Button>
                        </div>
                    </div>

                    <AnamnesisReportView 
                        patientId={patientId} 
                        initialData={anamnesisData} 
                    />
                </div>
            )
            }
        </div >
    )
}


