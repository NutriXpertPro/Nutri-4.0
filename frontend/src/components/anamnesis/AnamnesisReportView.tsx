"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { anamnesisService } from "@/services/anamnesis-service"
import { usePatient } from "@/hooks/usePatients"
import {
    Loader2,
    FileText,
    Activity,
    Moon,
    Heart,
    Ruler,
    Camera,
    TrendingUp,
    Target,
    User,
    Download,
    ChevronLeft,
    ChevronRight,
    X,
    MapPin,
    Phone,
    Calendar,
    Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { settingsService } from "@/services/settings-service"

interface AnamnesisReportViewProps {
    patientId: number
    onClose?: () => void
    initialData?: any
}

export function AnamnesisReportView({ patientId, onClose, initialData }: AnamnesisReportViewProps) {
    const [nutritionist, setNutritionist] = useState<any>(null)

    useEffect(() => {
        settingsService.getCombinedSettings().then((settings: any) => {
            setNutritionist({
                name: settings.profile.name,
                title: settings.profile.title,
                crn: settings.profile.crn,
                address: settings.branding.address,
                phone: settings.branding.phone,
                logo: settings.branding.logo
            })
        }).catch(console.error)
    }, [])

    const [currentAngle, setCurrentAngle] = useState(0)
    const [zoomPhoto, setZoomPhoto] = useState<string | null>(null)

    const { patient, isLoading: isLoadingPatient } = usePatient(patientId)

    const { data: standardAnamnesis, isLoading: isLoadingStandard } = useQuery({
        queryKey: ['anamnesis-standard', patientId],
        queryFn: () => anamnesisService.getStandardAnamnesis(patientId),
        enabled: !initialData && !!patientId
    })

    const { data: customResponses } = useQuery({
        queryKey: ['anamnesis-responses', patientId],
        queryFn: () => anamnesisService.listResponses(patientId),
        enabled: !!patientId
    })

    const { data: evolutionData } = useQuery({
        queryKey: ['anamnesis-evolution', patientId],
        queryFn: () => anamnesisService.getEvolution(patientId),
        enabled: !!patientId
    })

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

    const anamnesisData = initialData || {
        ...(patient?.anamnesis?.answers || {}),
        ...(standardAnamnesis || {}),
        nome: standardAnamnesis?.nome || patient?.name,
        email: standardAnamnesis?.email || patient?.email,
        objetivo: standardAnamnesis?.objetivo || patient?.goal,
        idade: standardAnamnesis?.idade || calculateAge(patient?.birth_date),
        updated_at: standardAnamnesis?.updated_at || patient?.anamnesis?.filled_date,
        id: standardAnamnesis?.id
    }

    const formatTime = (time?: string) => {
        if (!time) return "--"
        return time.split(':').slice(0, 2).join(':')
    }

    const formatNumber = (num?: string | number) => {
        if (!num) return "--"
        return String(Number(num))
    }

    const isLoading = (!initialData && (isLoadingPatient || isLoadingStandard))

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="bg-white dark:bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-border/10 relative w-full">
            {/* DECORATIVE TOP BAR */}
            <div className="h-3 w-full bg-emerald-500 print:h-2" />

            {/* HEADER - STANDARD DIET PDF STYLE */}
            <header className="p-12 pb-8 flex flex-col md:flex-row justify-between items-start print:p-8 bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans">
                <div className="space-y-6 max-w-full md:max-w-[65%]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 overflow-hidden shrink-0">
                            {nutritionist?.logo ? (
                                <img src={nutritionist.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <FileText className="h-7 w-7" />
                            )}
                        </div>
                        <h1 className="text-3xl font-normal tracking-tighter uppercase leading-none">
                            Ficha de<br /><span className="text-emerald-500">Anamnese</span>
                        </h1>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-emerald-500 opacity-80">Nutri Xpert Pro • Clínica Digital</p>

                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Paciente</span>
                            <h2 className="text-2xl font-normal tracking-tight">{anamnesisData?.nome}</h2>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-normal text-slate-500 dark:text-slate-400 pt-1">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Emitido em {anamnesisData?.updated_at ? new Date(anamnesisData.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '--'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>{anamnesisData?.idade} Anos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold">•</span>
                                    <span>{patient?.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-500 font-bold text-[10px]">ID</span>
                                    <span className="font-mono">#ANM-{anamnesisData?.id?.toString().padStart(4, '0') || '----'}</span>
                                </div>
                            </div>

                            <div className="pt-3 flex items-center gap-3">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Objetivo Clínico</span>
                                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20 px-3 py-0.5 rounded-lg text-[10px] font-medium tracking-wide shadow-xs">
                                    {(anamnesisData?.objetivo || "Não especificado").replace(/_/g, ' ')}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end gap-3 mt-8 md:mt-0">
                    <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl min-w-[200px] shadow-sm">
                        <p className="text-[9px] font-normal uppercase tracking-widest text-emerald-500 mb-1">Especialista</p>
                        <p className="text-sm font-normal text-slate-800 dark:text-slate-200 leading-tight">{nutritionist?.name || 'Seu Nome'}</p>
                        <p className="text-[10px] font-normal text-slate-400 mt-1">{nutritionist?.title || 'Nutricionista'} | CRN {nutritionist?.crn || '---'}</p>
                    </div>
                </div>
            </header>

            <main className="p-8 md:p-12 space-y-16 bg-linear-to-b from-white to-zinc-50/30 dark:from-zinc-950 dark:to-zinc-900/10 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none no-print">
                    <span className="text-[12rem] rotate-[-25deg] whitespace-nowrap">NUTRI XPERT</span>
                </div>

                <section className="space-y-10 relative z-10 w-full overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-linear-to-r from-transparent to-border/20" />
                        <div className="flex flex-col items-center px-4">
                            <h3 className="text-[10px] text-primary uppercase tracking-[0.4em]">Acompanhamento Visual</h3>
                            <h2 className="text-xl font-light tracking-tight mt-1">Evolução Corporal</h2>
                        </div>
                        <div className="h-px flex-1 bg-linear-to-l from-transparent to-border/20" />
                    </div>

                    <div className="relative max-w-4xl mx-auto px-12 group/carousel">
                        <button
                            onClick={() => setCurrentAngle(prev => prev === 0 ? 2 : prev - 1)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110 shadow-lg group-hover/carousel:translate-x-2"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        <button
                            onClick={() => setCurrentAngle(prev => prev === 2 ? 0 : prev + 1)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110 shadow-lg group-hover/carousel:-translate-x-2"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        <div className="relative overflow-hidden min-h-[400px]">
                            {currentAngle === 0 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                    <EvolutionAngle
                                        title="Foto de Frente"
                                        firstPhoto={evolutionData?.frente?.first}
                                        lastPhoto={evolutionData?.frente?.last}
                                        dates={evolutionData?.frente?.dates}
                                        setZoomPhoto={setZoomPhoto}
                                    />
                                </div>
                            )}
                            {currentAngle === 1 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                    <EvolutionAngle
                                        title="Foto de Lado"
                                        firstPhoto={evolutionData?.lado?.first}
                                        lastPhoto={evolutionData?.lado?.last}
                                        dates={evolutionData?.lado?.dates}
                                        setZoomPhoto={setZoomPhoto}
                                    />
                                </div>
                            )}
                            {currentAngle === 2 && (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                                    <EvolutionAngle
                                        title="Foto de Costas"
                                        firstPhoto={evolutionData?.costas?.first}
                                        lastPhoto={evolutionData?.costas?.last}
                                        dates={evolutionData?.costas?.dates}
                                        setZoomPhoto={setZoomPhoto}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-2 mt-6">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 transition-all duration-500 rounded-full",
                                        currentAngle === i ? "w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40 cursor-pointer"
                                    )}
                                    onClick={() => setCurrentAngle(i)}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {anamnesisData && (
                    <div className="space-y-16 relative z-10">
                        <div className="p-8 md:p-12 rounded-[2.5rem] border border-border/10 bg-white/40 dark:bg-zinc-900/10 shadow-sm backdrop-blur-xs relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 blur-2xl" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 relative z-10">
                                <ClinicalSection title="1. Identificação" icon={User}>
                                    <DataField label="Nome Completo" value={anamnesisData.nome} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Idade" value={anamnesisData.idade ? `${anamnesisData.idade} anos` : "--"} />
                                        <DataField label="Sexo" value={anamnesisData.sexo} />
                                    </div>
                                    <DataField label="Data de Nascimento" value={anamnesisData.nascimento ? new Date(anamnesisData.nascimento).toLocaleDateString('pt-BR') : "--"} />
                                    <DataField label="Profissão" value={anamnesisData.profissao} />
                                    <DataField label="E-mail" value={anamnesisData.email} />
                                    <DataField label="Telefone" value={anamnesisData.telefone} />
                                </ClinicalSection>

                                <ClinicalSection title="2. Rotina & Estilo de Vida" icon={Moon}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Acorda" value={formatTime(anamnesisData.hora_acorda)} />
                                        <DataField label="Dorme" value={formatTime(anamnesisData.hora_dorme)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Dificuldade p/ Dormir" value={anamnesisData.dificuldade_dormir ? "Sim" : "Não"} badge={anamnesisData.dificuldade_dormir ? "red" : "green"} />
                                        <DataField label="Acorda à Noite" value={anamnesisData.acorda_noite ? "Sim" : "Não"} badge={anamnesisData.acorda_noite ? "amber" : "green"} />
                                    </div>
                                    <DataField label="Horário de Treino" value={anamnesisData.horario_treino || "--"} />
                                    <DataField label="Tempo Disp. Treino" value={anamnesisData.tempo_disponivel_treino || "--"} />
                                    <DataField label="Dias de Treino/Semana" value={anamnesisData.dias_treino_semana ? `${anamnesisData.dias_treino_semana} dias` : "--"} />
                                </ClinicalSection>

                                <ClinicalSection title="3. Nutrição & Hábitos" icon={Activity}>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-light text-foreground">{formatNumber(anamnesisData.peso)}</span>
                                            <span className="text-[10px] text-muted-foreground mb-1.5 tracking-widest">KG</span>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-light text-foreground">{formatNumber(anamnesisData.altura)}</span>
                                            <span className="text-[10px] text-muted-foreground mb-1.5 tracking-widest">M</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Status do Peso" value={anamnesisData.peso_status || "Estável"} />
                                        <DataField label="Altura" value={anamnesisData.altura_status || "Estável"} />
                                    </div>
                                    <DataField label="Alimentos Restritos" value={anamnesisData.alimentos_restritos || "Nenhum"} isLong />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Já fez dieta?" value={anamnesisData.ja_fez_dieta ? "Sim" : "Não"} badge={anamnesisData.ja_fez_dieta ? "amber" : "green"} />
                                        <DataField label="Resultado da Dieta" value={anamnesisData.resultado_dieta || "--"} />
                                    </div>
                                    <DataField label="Intestino" value={anamnesisData.intestino || "--"} badge={anamnesisData.intestino === 'Preso' ? 'amber' : 'green'} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Dias sem banheiro" value={anamnesisData.dias_sem_banheiro || "--"} />
                                        <DataField label="Vezes ao dia" value={anamnesisData.vezes_banheiro_dia || "--"} />
                                    </div>
                                    <DataField label="Ingestão de Água" value={anamnesisData.litros_agua_dia ? `${anamnesisData.litros_agua_dia}L / dia` : "--"} />
                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px]  text-muted-foreground uppercase tracking-widest">Vontade de Doces</p>
                                            <span className="text-xs  text-amber-600">{anamnesisData.vontade_doce || 0}/10</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-linear-to-r from-amber-400 to-amber-600"
                                                style={{ width: `${(anamnesisData.vontade_doce || 0) * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                    <DataField label="Horários Maior Apetite" value={anamnesisData.horarios_maior_apetite || "--"} />
                                    <DataField label="Preferência Lanches" value={anamnesisData.preferencia_lanches || "--"} />
                                    <DataField label="Frutas de Preferência" value={anamnesisData.frutas_preferencia || "--"} />
                                </ClinicalSection>

                                <ClinicalSection title="4. Histórico de Saúde" icon={Heart}>
                                    <DataField label="Doenças Familiares" value={anamnesisData.doenca_familiar || "Nenhuma relatada"} isLong />
                                    <DataField label="Problema de Saúde" value={anamnesisData.problema_saude ? anamnesisData.problemas_saude_detalhes : "Não"} badge={anamnesisData.problema_saude ? "red" : "green"} isLong={anamnesisData.problema_saude} />
                                    <DataField label="Problema Articular" value={anamnesisData.problema_articular || "Não"} />
                                    <DataField label="Uso de Medicamentos" value={anamnesisData.uso_medicamentos ? anamnesisData.medicamentos_detalhes : "Não"} badge={anamnesisData.uso_medicamentos ? "amber" : "green"} isLong={anamnesisData.uso_medicamentos} />
                                    <DataField label="Alergia a Medicamento" value={anamnesisData.alergia_medicamento || "Nenhuma"} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Uso de Cigarros" value={anamnesisData.uso_cigarros ? "Sim" : "Não"} badge={anamnesisData.uso_cigarros ? "red" : "green"} />
                                        <DataField label="Intolerâncias" value={anamnesisData.intolerancia ? anamnesisData.intolerancia_detalhes : "Não"} badge={anamnesisData.intolerancia ? "amber" : "green"} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Anticoncepcional" value={anamnesisData.uso_anticoncepcional ? "Sim" : "Não"} />
                                        <DataField label="Uso de Álcool" value={anamnesisData.uso_alcool ? anamnesisData.alcool_frequencia : "Não"} badge={anamnesisData.uso_alcool ? "amber" : "green"} />
                                    </div>
                                    <DataField label="Termogênicos Usados" value={anamnesisData.termogenico_usado || "Nenhum"} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Já usou Anabolizante?" value={anamnesisData.ja_usou_anabolizante ? "Sim" : "Não"} badge={anamnesisData.ja_usou_anabolizante ? "red" : "green"} />
                                        <DataField label="Pretende usar?" value={anamnesisData.pretende_usar_anabolizante ? "Sim" : "Não"} badge={anamnesisData.pretende_usar_anabolizante ? "amber" : "green"} />
                                    </div>
                                    <DataField label="Histórico Anabolizantes" value={anamnesisData.anabolizante_problemas || "Sem registros"} isLong={!!anamnesisData.anabolizante_problemas} />
                                </ClinicalSection>

                                <ClinicalSection title="5. Objetivos & Compromisso" icon={Target}>
                                    <DataField label="Objetivo Principal" value={anamnesisData.objetivo || "Não definido"} isLong />
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataField label="Meta de Peso" value={anamnesisData.target_weight ? `${formatNumber(anamnesisData.target_weight)} kg` : "--"} />
                                        <DataField label="Meta de Gordura" value={anamnesisData.target_body_fat ? `${formatNumber(anamnesisData.target_body_fat)} %` : "--"} />
                                    </div>
                                    <DataField label="Compromisso c/ Relatórios" value={anamnesisData.compromisso_relatorios ? "Comprometido" : "Não comprometido"} badge={anamnesisData.compromisso_relatorios ? "green" : "red"} />
                                </ClinicalSection>

                                <ClinicalSection title="6. Medidas Antropométricas" icon={Ruler}>
                                    <div className="grid grid-cols-3 gap-4">
                                        <DataField label="Pescoço" value={anamnesisData.pescoco ? `${formatNumber(anamnesisData.pescoco)} cm` : "--"} />
                                        <DataField label="Cintura" value={anamnesisData.cintura ? `${formatNumber(anamnesisData.cintura)} cm` : "--"} />
                                        <DataField label="Quadril" value={anamnesisData.quadril ? `${formatNumber(anamnesisData.quadril)} cm` : "--"} />
                                    </div>
                                </ClinicalSection>
                            </div>
                        </div>

                        {customResponses && customResponses.length > 0 && (
                            <div className="pt-16 border-t border-border/10 space-y-10">
                                <h3 className="text-center text-[10px]  text-muted-foreground uppercase tracking-[0.4em]">Questionários Adicionais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {customResponses.map((response: any) => (
                                        <div key={response.id} className="p-6 rounded-3xl bg-muted/5 border border-border/10 space-y-4">
                                            <h4 className=" text-sm text-primary uppercase tracking-wider">{response.template_title}</h4>
                                            <div className="space-y-3">
                                                {Object.entries(response.answers).map(([q, a]) => (
                                                    <div key={q} className="space-y-1">
                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{q}</p>
                                                        <p className="text-sm font-normal">{String(a)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <style jsx global>{`
                    @media print {
                        body { background: white !important; }
                        .no-print { display: none !important; }
                        .bg-white { box-shadow: none !important; border: 1px solid #eee !important; }
                    }
                `}</style>
            </main>

            <footer className="p-8 md:p-12 bg-muted/10 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Relatório Profissional Nutri Xpert Pro</p>
                </div>
                <div className="flex gap-2">
                    {onClose && (
                        <Button variant="outline" className="rounded-2xl gap-2 text-xs no-print" onClick={onClose}>
                            <X className="h-4 w-4" />
                            Fechar
                        </Button>
                    )}
                    <Button variant="outline" className="rounded-2xl gap-2 text-xs no-print" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        Exportar PDF
                    </Button>
                </div>
            </footer>

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
            <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/logo.png" alt="Icon" className="h-10 w-auto relative z-10 drop-shadow-md transition-all duration-500 group-hover:scale-110" />
            </div>
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

function EvolutionAngle({ title, firstPhoto, lastPhoto, dates, setZoomPhoto }: { title: string, firstPhoto?: string, lastPhoto?: string, dates?: string[], setZoomPhoto: (url: string | null) => void }) {
    return (
        <div className="group/angle animate-in zoom-in duration-1000 mb-20">
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 blur-sm opacity-50 rounded-full" />
                    <Badge variant="outline" className="relative px-8 py-2 rounded-full border-zinc-200 dark:border-primary/30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md text-primary dark:text-primary text-[11px] font-normal uppercase tracking-[0.5em] shadow-xl">
                        {title}
                    </Badge>
                </div>
            </div>

            <div className="relative bg-zinc-50 dark:bg-[#050505] rounded-[2.5rem] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden border-[14px] border-zinc-100 dark:border-[#0a0a0a] ring-1 ring-black/5 dark:ring-white/10 mx-auto max-w-4xl group/frame">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none transition-transform duration-500 group-hover/frame:scale-105">
                    <LogoInFrame />
                    <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-1 relative z-10 pt-20">
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
                        <div className="absolute inset-0 ring-inset ring-1 ring-black/5 dark:ring-white/5 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/90 via-zinc-50/40 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-8 z-20">
                            <p className="text-[9px] text-zinc-500 dark:text-white/40 font-normal tracking-[0.3em] mb-1">INÍCIO</p>
                            <p className="text-sm font-normal text-zinc-900 dark:text-white tracking-widest">{dates?.[0] || '--/--/----'}</p>
                        </div>
                    </div>

                    <div className="relative aspect-[4/4.25] bg-zinc-100 dark:bg-[#111] group/photo overflow-hidden rounded-br-[1.5rem]">
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
                        <div className="absolute inset-0 ring-inset ring-1 ring-black/5 dark:ring-white/5 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-50/90 via-zinc-50/40 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 right-8 z-20 text-right">
                            <p className="text-[9px] text-primary dark:text-primary/60 font-normal tracking-[0.3em] mb-1">RESULTADO</p>
                            <p className="text-sm font-normal text-zinc-900 dark:text-white tracking-widest">{dates?.[1] || '--/--/----'}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-200 dark:bg-white/10 z-20 pointer-events-none" />
            </div>
        </div>
    )
}
