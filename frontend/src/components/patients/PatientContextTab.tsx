"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, HeartPulse, Stethoscope, AlertCircle, Calendar, Heart, Users, Cake, Phone, Mail, Clock, Target, Moon, Activity, Brain } from "lucide-react"
import { IconWrapper } from "@/components/ui/IconWrapper"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { notificationService } from "@/services/notification-service"

import { usePatient } from "@/hooks/usePatients"
import { Skeleton } from "@/components/ui/skeleton"

interface PatientContextTabProps {
    patientId: number
}

export function PatientContextTab({ patientId }: PatientContextTabProps) {
    const { patient, isLoading } = usePatient(patientId)

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
    const getAnamnesisValue = (keys: string[]): string | string[] | null => {
        const anamnesis = patient?.anamnesis as any
        if (!anamnesis) return null

        if (anamnesis.answers) {
            for (const key of keys) {
                if (anamnesis.answers[key]) return anamnesis.answers[key]
            }
            for (const key of keys) {
                const foundKey = Object.keys(anamnesis.answers).find(k => k.toLowerCase().includes(key.toLowerCase()))
                if (foundKey) return anamnesis.answers[foundKey]
            }
        }
        return null
    }

    // Extração de dados clínicos
    const restrictedFoods = getAnamnesisValue(['alimentos_restritos'])
    const drugAllergies = getAnamnesisValue(['alergia_medicamento'])
    const familyDiseases = getAnamnesisValue(['doencas_familiares'])
    const healthProblems = getAnamnesisValue(['problema_saude_detalhes'])
    const medications = getAnamnesisValue(['medicamentos'])
    const intestine = getAnamnesisValue(['intestino'])

    // Extração de Rotina
    const wakeTime = getAnamnesisValue(['acorda', 'despertar', 'levantar'])
    const sleepTime = getAnamnesisValue(['dorme', 'deita', 'sono'])
    const sleepDiff = getAnamnesisValue(['sono_dificuldade', 'dificuldade', 'insônia'])

    const workoutTime = getAnamnesisValue(['treino_horario', 'horário de treino'])
    const workoutDuration = getAnamnesisValue(['treino_duracao', 'tempo disponível'])
    const workoutFreq = getAnamnesisValue(['treino_frequencia', 'frequência'])

    useEffect(() => {
        notificationService.initializeNotificationService();
    }, []);

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-7 pb-10">
                <Skeleton className="col-span-3 h-[400px] rounded-xl" />
                <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                <Skeleton className="col-span-full h-48 rounded-xl" />
            </div>
        )
    }

    if (!patient) return null

    return (
        <div className="grid gap-6 md:grid-cols-7 pb-10 pt-[10px]">
            {/* 1. DADOS PESSOAIS */}
            <Card variant="glass" className="col-span-3 border-none bg-background/50 h-fit">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <IconWrapper icon={User} variant="blue" size="md" />
                    <div>
                        <CardTitle className="text-xl font-normal tracking-tight">Identificação</CardTitle>
                        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Informações Pessoais</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <InfoItem icon={Target} label="Objetivo" value={patient?.goal || 'Não definido'} iconColor="text-rose-500" />
                        <InfoItem icon={Cake} label="Idade" value={patient?.birth_date ? `${calculateAge(patient.birth_date)} anos` : '--'} sub={patient?.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR') : undefined} iconColor="text-pink-500" />
                        <InfoItem icon={User} label="Gênero" value={patient?.gender === 'M' ? 'Masculino' : patient?.gender === 'F' ? 'Feminino' : '--'} iconColor="text-blue-500" />
                        <InfoItem icon={Phone} label="Telefone" value={patient?.phone || '--'} iconColor="text-emerald-500" />
                        <InfoItem icon={Mail} label="Email" value={patient?.email || '--'} className="truncate" iconColor="text-violet-500" />
                        <InfoItem icon={Calendar} label="Início" value={patient?.start_date ? new Date(patient.start_date).toLocaleDateString('pt-BR') : '--'} iconColor="text-indigo-500" />
                    </div>
                </CardContent>
            </Card>

            {/* 2. HISTÓRICO DE SAÚDE */}
            <Card variant="glass" className="col-span-4 border-none bg-background/50 h-fit">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <IconWrapper icon={HeartPulse} variant="emerald" size="md" />
                    <div>
                        <CardTitle className="text-xl font-normal tracking-tight">Ficha Clínica</CardTitle>
                        <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Respostas da Anamnese</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">

                    <div className="grid sm:grid-cols-2 gap-6">
                        <Section
                            icon={Target}
                            color="text-orange-500"
                            title="Alimentos Restritos"
                            content={restrictedFoods}
                            type="text"
                            emptyText="Nenhuma restrição."
                        />
                        <Section
                            icon={AlertCircle}
                            color="text-destructive"
                            title="Alergia a Medicamento"
                            content={drugAllergies}
                            type="text"
                            emptyText="Nenhuma alergia."
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/10">
                        <Section
                            icon={Users}
                            color="text-amber-500"
                            title="Doenças Familiares"
                            content={familyDiseases}
                            type="text"
                            emptyText="Nenhuma registrada."
                        />
                        <Section
                            icon={Stethoscope}
                            color="text-indigo-500"
                            title="Problema de Saúde"
                            content={healthProblems}
                            type="text"
                            emptyText="Não informado."
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/10">
                        <Section
                            icon={Heart}
                            color="text-pink-500"
                            title="Uso de Medicamentos"
                            content={medications}
                            type="text"
                            emptyText="Não."
                        />
                        <Section
                            icon={Activity}
                            color="text-cyan-500"
                            title="Intestino"
                            content={intestine}
                            type="text"
                            emptyText="Regular."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 3. ROTINA E HÁBITOS */}
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
    const hasData = list.length > 0 && list[0] !== null && list[0] !== ""

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