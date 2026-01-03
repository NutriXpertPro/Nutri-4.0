"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, HeartPulse, Stethoscope, AlertCircle, Calendar, Briefcase, Heart, Users, Cake, Phone, Mail, Clock, Target, Moon, Droplets, Activity, Brain } from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { PatientContext } from "@/stores/diet-editor-store"
import { cn } from "@/lib/utils"

interface PatientContextTabProps {
    patient?: PatientContext
}

export function PatientContextTab({ patient }: PatientContextTabProps) {
    // Helper para idade
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

    // Helper para extrair dados da Anamnese (se existirem)
    // Tenta encontrar chaves comuns nas respostas
    const getAnamnesisValue = (keys: string[]): string | string[] | null => {
        if (!patient?.anamnesis?.answers) return null
        for (const key of keys) {
            // Busca case-insensitive
            const foundKey = Object.keys(patient.anamnesis.answers).find(k => k.toLowerCase().includes(key.toLowerCase()))
            if (foundKey) return patient.anamnesis.answers[foundKey]
        }
        return null
    }

    // Extração de dados clínicos da Anamnese
    const allergies = getAnamnesisValue(['alergia', 'restrições']) || patient?.allergies
    const pathologies = getAnamnesisValue(['patologia', 'doença', 'morbidade']) || patient?.pathologies
    const medications = getAnamnesisValue(['medicamento', 'remedio', 'fármaco']) || patient?.medications
    const familyHistory = getAnamnesisValue(['familia', 'hereditário'])
    const surgeries = getAnamnesisValue(['cirurgia', 'internação'])

    // Extração de Rotina (Novos campos específicos)
    const wakeTime = getAnamnesisValue(['acorda', 'despertar', 'levantar'])
    const sleepTime = getAnamnesisValue(['dorme', 'deita', 'sono'])
    const sleepDiff = getAnamnesisValue(['dificuldade', 'insônia', 'qualidade do sono'])

    const workoutTime = getAnamnesisValue(['horário de treino', 'hora do treino', 'treina as'])
    const workoutDuration = getAnamnesisValue(['tempo disponível', 'duração', 'quanto tempo'])
    const workoutFreq = getAnamnesisValue(['quantas vezes', 'frequência', 'dias por semana'])

    // Formata array ou string para array de strings
    const formatToList = (val: any): string[] => {
        if (Array.isArray(val)) return val
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
        return []
    }

    return (
        <div className="grid gap-6 md:grid-cols-7 pb-10">
            {/* 1. DADOS PESSOAIS E ADMINISTRATIVOS (Consolidado) - Coluna Esquerda */}
            <Card variant="glass" className="col-span-3 border-none bg-background/50 h-fit">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <IconWrapper icon={User} variant="blue" size="md" />
                    <div>
                        <CardTitle className="text-xl font-normal tracking-tight">Identificação</CardTitle>
                        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Informações Pessoais</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    {/* Grid de Detalhes */}
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={Target} label="Objetivo" value={patient?.goal || 'Não definido'} iconColor="text-rose-500" />
                        <InfoItem icon={Cake} label="Idade" value={patient?.birth_date ? `${calculateAge(patient.birth_date)} anos` : '--'} sub={patient?.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : undefined} iconColor="text-pink-500" />
                        <InfoItem icon={User} label="Gênero" value={patient?.sex === 'M' ? 'Masculino' : patient?.sex === 'F' ? 'Feminino' : '--'} iconColor="text-blue-500" />
                        <InfoItem icon={Phone} label="Telefone" value={patient?.phone || '--'} iconColor="text-emerald-500" />
                        <InfoItem icon={Mail} label="Email" value={patient?.email || '--'} className="truncate" iconColor="text-violet-500" />
                        <InfoItem icon={Calendar} label="Início" value={patient?.start_date ? new Date(patient.start_date).toLocaleDateString('pt-BR') : '--'} iconColor="text-indigo-500" />
                    </div>
                </CardContent>
            </Card>

            {/* 2. HISTÓRICO DE SAÚDE (Expandido e Conectado) - Coluna Direita */}
            <Card variant="glass" className="col-span-4 border-none bg-background/50 h-fit">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <IconWrapper icon={HeartPulse} variant="emerald" size="md" />
                    <div>
                        <CardTitle className="text-xl font-normal tracking-tight">Histórico de Saúde</CardTitle>
                        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Baseado na Anamnese</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    {/* Alergias */}
                    <Section
                        icon={AlertCircle}
                        color="text-destructive"
                        title="Alergias & Restrições"
                        content={allergies}
                        type="badge"
                        emptyText="Nenhuma alergia relatada."
                    />

                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Patologias */}
                        <Section
                            icon={Stethoscope}
                            color="text-amber-500"
                            title="Patologias Presgressas"
                            content={pathologies}
                            type="list"
                            emptyText="Nenhuma patologia relatada."
                        />

                        {/* Medicamentos */}
                        <Section
                            icon={Heart}
                            color="text-indigo-500"
                            title="Medicamentos em Uso"
                            content={medications}
                            type="list"
                            emptyText="Nenhum uso contínuo."
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-border/10">
                        {/* Histórico Familiar */}
                        <Section
                            icon={Users}
                            color="text-violet-500"
                            title="Histórico Familiar"
                            content={familyHistory}
                            type="text"
                            emptyText="Não informado."
                        />
                        {/* Cirurgias */}
                        <Section
                            icon={Activity}
                            color="text-cyan-500"
                            title="Cirurgias / Internações"
                            content={surgeries}
                            type="text"
                            emptyText="Não informado."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 3. ROTINA E HÁBITOS (Específico: Sono e Treino) - Full Width */}
            <Card variant="glass" className="col-span-full border-none bg-background/50">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <IconWrapper icon={Brain} variant="violet" size="md" />
                    <div>
                        <CardTitle className="text-xl font-normal tracking-tight">Rotina & Treino</CardTitle>
                        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Sono e Atividade Física</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Sono - Amber Theme (Luz Amarela) */}
                        <InfoItem
                            icon={Moon}
                            label="Hora que Dorme"
                            value={sleepTime || '--'}
                            className="bg-amber-500/5 border-amber-500/10"
                            iconColor="text-amber-500"
                        />
                        <InfoItem
                            icon={Activity}
                            label="Hora que Acorda"
                            value={wakeTime || '--'}
                            className="bg-amber-500/5 border-amber-500/10"
                            iconColor="text-amber-500"
                        />
                        <InfoItem
                            icon={Brain}
                            label="Dificuldade p/ Dormir"
                            value={sleepDiff || 'Não relatado'}
                            className="bg-amber-500/5 border-amber-500/10"
                            iconColor="text-amber-500"
                        />

                        {/* Treino - Emerald Theme (Atividade) */}
                        <InfoItem
                            icon={Clock}
                            label="Horário de Treino"
                            value={workoutTime || '--'}
                            className="bg-emerald-500/5 border-emerald-500/10"
                            iconColor="text-emerald-500"
                        />
                        <InfoItem
                            icon={Activity}
                            label="Tempo Disponível de Treino"
                            value={workoutDuration || '--'}
                            className="bg-emerald-500/5 border-emerald-500/10"
                            iconColor="text-emerald-500"
                        />
                        <InfoItem
                            icon={Calendar}
                            label="Frequência Semanal"
                            value={workoutFreq || '--'}
                            className="bg-emerald-500/5 border-emerald-500/10"
                            iconColor="text-emerald-500"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Sub-components para organização
function InfoItem({ icon: Icon, label, value, sub, className, iconColor }: any) {
    return (
        <div className={cn("p-2.5 rounded-lg bg-background/40 border border-border/5 flex items-start gap-3", className)}>
            <Icon className={cn("w-3.5 h-3.5 mt-0.5", iconColor || "text-muted-foreground")} />
            <div className="overflow-hidden">
                <p className={cn("text-[9px] font-bold uppercase tracking-wider", iconColor ? "opacity-90" : "text-muted-foreground")}>{label}</p>
                <p className="text-xs font-medium text-foreground truncate" title={String(value)}>{value}</p>
                {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

function Section({ icon: Icon, color, title, content, type, emptyText }: any) {
    const list = Array.isArray(content) ? content : (typeof content === 'string' ? [content] : [])
    const hasData = list.length > 0

    return (
        <div className="space-y-2">
            <div className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", color)}>
                <Icon className="w-3.5 h-3.5" />
                {title}
            </div>

            {!hasData ? (
                <p className="text-xs text-muted-foreground italic pl-5">{emptyText}</p>
            ) : (
                <div className="pl-1">
                    {type === 'badge' && (
                        <div className="flex flex-wrap gap-1.5">
                            {list.map((item: string, i: number) => (
                                <Badge key={i} variant="destructive" className="font-normal text-[10px] px-2 h-5 uppercase">{item}</Badge>
                            ))}
                        </div>
                    )}
                    {(type === 'list' || type === 'text') && (
                        <ul className="space-y-1.5">
                            {list.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-xs font-medium text-foreground">
                                    <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0 bg-current opacity-40", color.replace('text-', 'bg-'))} />
                                    <span className="leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}

function RoutineCard({ icon: Icon, title, value, fallback, color }: any) {
    // Extract color hex roughly for style
    // Using CSS variable hacks for color opacity
    return (
        <div className="p-4 rounded-xl bg-background/40 border border-border/5 hover:bg-background/60 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-12 h-12" style={{ color }} />
            </div>
            <div className="relative z-10">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    {title}
                </h4>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                    {value ? (Array.isArray(value) ? value.join(', ') : value) : fallback}
                </p>
            </div>
        </div>
    )
}
