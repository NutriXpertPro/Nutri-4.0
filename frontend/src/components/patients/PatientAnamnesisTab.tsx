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

    // Inteligência: Se o usuário entrar na aba sem um modo específico e já tiver anamnese, mostra o relatório
    useEffect(() => {
        if (view === 'LIST' && standardAnamnesis && (!anamnesisViewMode || anamnesisViewMode === 'list')) {
            setView('VIEW_RESPONSES');
        }
    }, [standardAnamnesis, view, anamnesisViewMode]);

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

// COMPONENTES AUXILIARES PARA A FICHA CLÍNICA SUPERIOR

function ClinicalSection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex items-center gap-3 pb-4 border-b border-border/10">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                    <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-medium text-foreground uppercase tracking-[0.2em]">{title}</h4>
            </div>
            <div className="space-y-8 pt-2">
                {children}
            </div>
        </div>
    )
}

function DataField({ label, value, badge, isLong, compact }: { label: string, value: string | number, badge?: 'green' | 'amber' | 'red', isLong?: boolean, compact?: boolean }) {
    const badgeColors = {
        green: 'bg-primary/10 text-primary border-primary/20',
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        red: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    }

    return (
        <div className={cn("space-y-3 group", compact ? "mb-0" : "mb-10")}>
            <p className="text-[10px] font-normal text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                {label}
                {badge && (
                    <span className={cn("h-1 w-1 rounded-full animate-pulse", badge === 'green' ? 'bg-primary' : badge === 'amber' ? 'bg-amber-500' : 'bg-rose-500')} />
                )}
            </p>
            {badge ? (
                <div className="flex items-start">
                    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-lg font-normal text-[10px] uppercase tracking-wider h-auto min-h-[24px] inline-flex", badgeColors[badge])}>
                        {value}
                    </Badge>
                </div>
            ) : (
                <p className={cn(
                    "font-normal text-foreground leading-relaxed first-letter:uppercase lowercase",
                    isLong ? "text-sm bg-muted/5 p-4 rounded-2xl border border-border/5" : "text-sm",
                    compact ? "text-sm" : ""
                )}>
                    {value || '--'}
                </p>
            )}
        </div>
    )
}

function LogoInFrame() {
    return (
        <div className="flex items-center gap-3 group select-none cursor-default">
            {/* Logo Icon */}
            <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/logo.png" alt="Icon" className="h-10 w-auto relative z-10 drop-shadow-md transition-all duration-500 group-hover:scale-110" />
            </div>
            {/* Logo Text */}
            <div className="flex flex-col">
                <div className="text-sm font-medium flex items-center tracking-tight leading-none">
                    <span className="text-zinc-900 dark:text-white">Nutri</span>
                    <span className="text-primary ml-1">Xpert</span>
                    <span className="text-zinc-900 dark:text-white ml-1">Pro</span>
                </div>
                <div className="text-[6px] font-medium text-primary/60 uppercase tracking-[0.4em] mt-1 leading-none">Performance Lab</div>
            </div>
        </div>
    )
}

function EvolutionAngle({ title, firstPhoto, lastPhoto, dates }: { title: string, firstPhoto?: string, lastPhoto?: string, dates?: string[] }) {
    const [zoomPhoto, setZoomPhoto] = useState<string | null>(null)

    return (
        <div className="group/angle animate-in zoom-in duration-1000 mb-20">
            {/* Título da Seção */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 blur-sm opacity-50 rounded-full" />
                    <Badge variant="outline" className="relative px-8 py-2 rounded-full border-zinc-200 dark:border-primary/30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md text-primary dark:text-primary text-[11px] font-normal uppercase tracking-[0.5em] shadow-xl">
                        {title}
                    </Badge>
                </div>
            </div>

            {/* MOLDURA ÚNICA PREMIUM (COLLAGE) */}
            <div className="relative bg-zinc-50 dark:bg-[#050505] rounded-[2.5rem] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden border-[14px] border-zinc-100 dark:border-[#0a0a0a] ring-1 ring-black/5 dark:ring-white/10 mx-auto max-w-4xl group/frame">

                {/* LOGO CENTRAL SUPERIOR INTEGRADA NA MOLDURA */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none transition-transform duration-500 group-hover/frame:scale-105">
                    <LogoInFrame />
                    <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-1 relative z-10 pt-20">
                    {/* FOTO INICIAL (ESQUERDA) */}
                    <div className="relative aspect-[4/4.25] bg-zinc-100 dark:bg-[#111] group/photo overflow-hidden rounded-bl-[1.5rem] border-r border-black/5 dark:border-white/5">
                        {firstPhoto ? (
                            <img
                                src={firstPhoto}
                                alt="Inicial"
                                className="w-full h-full object-cover transition-all duration-1000 group-hover/photo:scale-110 cursor-zoom-in"
                                onClick={() => setZoomPhoto(firstPhoto)}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-800">
                                <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4">
                                    <Camera className="h-8 w-8 opacity-20" />
                                </div>
                                <span className="text-[9px] font-normal uppercase tracking-[0.3em] opacity-30">Inicial Pendente</span>
                            </div>
                        )}

                        {/* Overlay Premium */}
                        <div className="absolute inset-0 ring-inset ring-1 ring-black/5 dark:ring-white/5 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/90 via-zinc-50/40 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent pointer-events-none" />

                        <div className="absolute bottom-6 left-8 z-20">
                            <p className="text-[9px] text-zinc-500 dark:text-white/40 font-normal tracking-[0.3em] mb-1">INÍCIO</p>
                            <p className="text-sm font-normal text-zinc-900 dark:text-white tracking-widest">{dates?.[0] || '--/--/----'}</p>
                        </div>
                    </div>

                    {/* FOTO ATUAL (DIREITA) */}
                    <div className="relative aspect-[4/4.25] bg-zinc-100 dark:bg-[#111] group/photo overflow-hidden rounded-br-[1.5rem]">
                        {/* Só mostrar a foto 'atual' se ela for diferente da inicial. */}
                        {lastPhoto && lastPhoto !== firstPhoto ? (
                            <img
                                src={lastPhoto}
                                alt="Atual"
                                className="w-full h-full object-cover transition-all duration-1000 group-hover/photo:scale-110 cursor-zoom-in"
                                onClick={() => setZoomPhoto(lastPhoto)}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-primary/30">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                    <TrendingUp className="h-8 w-8 opacity-20" />
                                </div>
                                <span className="text-[9px] font-normal uppercase tracking-[0.3em] opacity-30">Resultado Pendente</span>
                            </div>
                        )}

                        {/* Overlay Premium */}
                        <div className="absolute inset-0 ring-inset ring-1 ring-black/5 dark:ring-white/5 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/90 via-zinc-50/40 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent pointer-events-none" />

                        <div className="absolute bottom-6 right-8 z-20 text-right">
                            <p className="text-[9px] text-primary dark:text-primary/60 font-normal tracking-[0.3em] mb-1">RESULTADO</p>
                            <p className="text-sm font-normal text-zinc-900 dark:text-white tracking-widest">{dates?.[1] || '--/--/----'}</p>
                        </div>
                    </div>
                </div>

                {/* Divisória Central */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-200 dark:bg-white/10 z-20 pointer-events-none" />
            </div>

            {/* LIGHTBOX / ZOOM */}
            {zoomPhoto && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 cursor-zoom-out animate-in fade-in duration-500" onClick={() => setZoomPhoto(null)}>
                    <div className="relative max-w-full max-h-full">
                        <img src={zoomPhoto} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-2 ring-white/10" />
                        <Button variant="ghost" className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full h-10 w-10 flex items-center justify-center" onClick={() => setZoomPhoto(null)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}


