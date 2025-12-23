"use client"

import React from 'react'
import {
    Calculator,
    Flame,
    Activity,
    ChevronDown,
    ChevronLeft,
    Target,
    Dna,
    FileText,
    Smartphone,
    Search,
    Users,
    Utensils
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    useDietEditorStore,
    useDietEditorPatient,
    useDietEditorMeals,
    CalculationMethod,
    DietType,
    ACTIVITY_LEVELS,
    DIET_TYPE_MACROS
} from '@/stores/diet-editor-store'
import { NavigationCommandPalette } from './NavigationCommandPalette'
import { HubNavigation } from './HubNavigation'
import { NeonText } from '../design/GlassPrimitives'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Mock Patients
const MOCK_PATIENTS = [
    { id: 1, name: 'João Silva', age: 32, weight: 78, height: 1.78, sex: 'M', goal: 'Hipertrofia', objective: 'Ganho de Massa' },
    { id: 2, name: 'Maria Oliveira', age: 28, weight: 62, height: 1.65, sex: 'F', goal: 'Emagrecimento', objective: 'Perda de Gordura' },
    { id: 3, name: 'Carlos Santos', age: 45, weight: 92, height: 1.82, sex: 'M', goal: 'Manutenção', objective: 'Saúde Geral' },
]

export function EcoHeader() {
    const router = useRouter()
    const patient = useDietEditorPatient()
    const meals = useDietEditorMeals()

    // Global Navigation State
    const activeTab = useDietEditorStore(state => state.activeTab)
    const setActiveTab = useDietEditorStore(state => state.setActiveTab)

    // Command Palette State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false)

    // Store Actions & State
    const {
        setPatient,
        calculationMethod,
        setCalculationMethod,
        activityLevel,
        setActivityLevel,
        dietType,
        setDietType,
        tmb,
        get,
        targetCalories,
        targetMacros
    } = useDietEditorStore()

    // Real-time Calculations
    const currentTotals = meals.reduce((acc, meal) => {
        meal.items.forEach(item => {
            acc.calories += item.calories
            acc.protein += item.protein
            acc.carbs += item.carbs
            acc.fats += item.fats
            acc.fiber += (item as any).fiber || 0
        })
        return acc
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 })


    const weight = patient?.weight || 70

    // Helper for macro display data
    const getMacroData = (current: number, target: number, label: string) => {
        const perKg = (current / weight).toFixed(1)
        const diff = Math.round(target - current)
        const progress = Math.min((current / (target || 1)) * 100, 100)

        let statusColor = "bg-primary"
        if (progress > 110) statusColor = "bg-red-500"
        else if (progress >= 90) statusColor = "bg-green-500"
        else statusColor = "bg-amber-500"

        return { current, target, perKg, diff, progress, statusColor, label }
    }

    const proteinData = getMacroData(currentTotals.protein, targetMacros.protein, "PTN")
    const carbsData = getMacroData(currentTotals.carbs, targetMacros.carbs, "CHO")
    const fatsData = getMacroData(currentTotals.fats, targetMacros.fats, "FAT")
    const fiberData = getMacroData(currentTotals.fiber || 0, targetMacros.fiber || 25, "FIB")

    return (
        <>
            <div className="relative mb-4 bg-background z-40 shadow-sm border-b border-border/10 pb-8">
                {/* Background Banner */}
                <div className="h-20 w-full bg-linear-to-r from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                    {/* Back Button */}
                    <Link
                        href="/diets"
                        className="absolute top-6 left-4 p-2 rounded-full bg-background text-foreground hover:bg-background hover:text-foreground transition-all backdrop-blur-sm z-10 border border-border opacity-80 hover:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </div>

                {/* FLOATING CIRCULAR GRAPH */}
                <div className="absolute left-1/2 -translate-x-1/2 top-20 -translate-y-1/2 z-50">
                    <CircularMacroChart
                        totals={currentTotals}
                        targets={targetMacros}
                        targetCalories={targetCalories}
                    />
                </div>

                <div className="px-6 md:px-10 -mt-8 flex flex-col gap-8 relative z-10">

                    {/* ROW 1: Profile & Actions */}
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">

                        {/* Avatar (Overlapping) with Selector */}
                        <div className="relative group">
                            <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-transform group-hover:scale-105">
                                <AvatarImage src={patient?.photo} />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {patient?.name?.substring(0, 2).toUpperCase() || <Users className="h-10 w-10 opacity-50" />}
                                </AvatarFallback>
                            </Avatar>

                            {/* Patient Switching Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs backdrop-blur-sm">
                                        TROCAR
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[300px]">
                                    <DropdownMenuLabel className="px-4 py-3">Selecionar Paciente</DropdownMenuLabel>
                                    <div className="px-3 py-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="Buscar por nome..." className="h-10 pl-10 text-sm bg-muted/50" />
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    {MOCK_PATIENTS.map(p => (
                                        <DropdownMenuItem
                                            key={p.id}
                                            onClick={() => setPatient(p as any)}
                                            className="flex flex-col items-start cursor-pointer py-3 px-4 focus:bg-primary/10"
                                        >
                                            <span className="text-base">{p.name}</span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span>{p.objective}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{p.weight}kg</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Badge className="absolute bottom-2 right-2 border-2 border-background bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 shadow-lg">
                                Ativo
                            </Badge>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-2 mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <h1 className="text-h1">
                                    {patient?.name || 'Novo Paciente'}
                                </h1>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="text-muted-foreground bg-background/50 px-3 h-7">
                                        {patient?.age || '--'} anos
                                    </Badge>
                                    <Badge variant="outline" className="text-muted-foreground bg-background/50 px-3 h-7">
                                        {patient?.weight || '--'} kg
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-5">
                                <span className="flex items-center gap-2 text-subtitle">
                                    <Target className="h-4 w-4 text-primary" />
                                    <span className="uppercase tracking-wider text-[11px]">{patient?.goal || 'Objetivo'}</span>
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                <span className="text-emerald-500 text-xs uppercase tracking-tight">Adesão Presumida: 90%</span>
                            </div>
                        </div>

                        {/* Actions & Strategies */}
                        <div className="flex flex-col items-end gap-3 w-full md:w-auto mb-2">
                            {/* Buttons */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-8 gap-2 rounded-xl text-[10px] uppercase tracking-widest text-muted-foreground border-border/50 hover:border-amber-500/40 transition-all">
                                    <FileText className="h-3.5 w-3.5 text-amber-500" />
                                    Exportar PDF
                                </Button>
                                <Button variant="outline" size="sm" className="h-8 gap-2 rounded-xl text-[10px] uppercase tracking-widest text-muted-foreground border-border/50 hover:border-primary/40 transition-all">
                                    <Smartphone className="h-3.5 w-3.5 text-primary" />
                                    Enviar App
                                </Button>
                            </div>

                            {/* Selectors */}
                            <div className="flex gap-2">
                                <Selector
                                    icon={Utensils}
                                    label={
                                        {
                                            'harris_benedict_1919': 'Harris-Benedict 1919',
                                            'harris_benedict_1984': 'Harris-Benedict 1984',
                                            'harris_benedict': 'Harris-Benedict 1984',
                                            'mifflin_1990': 'Mifflin-St Jeor 1990',
                                            'mifflin': 'Mifflin-St Jeor 1990',
                                            'henry_rees_1991': 'Henry & Rees 1991',
                                            'tinsley_2018_weight': 'Tinsley 2018 (Peso)',
                                            'katch_mcardle_1996': 'Katch-McArdle 1996',
                                            'cunningham_1980': 'Cunningham 1980',
                                            'cunningham': 'Cunningham 1980',
                                            'tinsley_2018_lbm': 'Tinsley 2018 (Massa Magra)',
                                            'fao_who_2004': 'FAO/WHO 2004',
                                            'eer_iom_2005': 'EER/IOM 2005',
                                            'eer_iom_2023': 'EER/IOM 2023',
                                        }[calculationMethod] || 'Mifflin-St Jeor 1990'
                                    }
                                >
                                    {[
                                        {
                                            value: 'mifflin_1990',
                                            label: 'Mifflin-St Jeor 1990',
                                            desc: 'Padrão-ouro atual para indivíduos saudáveis e com sobrepeso/obesidade.'
                                        },
                                        {
                                            value: 'harris_benedict_1919',
                                            label: 'Harris-Benedict 1919',
                                            desc: 'Equação clássica. Tende a superestimar a TMB em 5-15%.'
                                        },
                                        {
                                            value: 'harris_benedict_1984',
                                            label: 'Harris-Benedict 1984',
                                            desc: 'Revisão da original. Boa para histórico comparativo.'
                                        },
                                        {
                                            value: 'henry_rees_1991',
                                            label: 'Henry & Rees 1991',
                                            desc: 'Específica para populações de zonas tropicais (climas quentes).'
                                        },
                                        {
                                            value: 'tinsley_2018_weight',
                                            label: 'Tinsley 2018 (Peso)',
                                            desc: 'Recente e validada para atletas de força e fisiculturistas.'
                                        },
                                        {
                                            value: 'katch_mcardle_1996',
                                            label: 'Katch-McArdle 1996',
                                            desc: 'Baseada na Massa Livre de Gordura (MLG). Essencial para atletas.'
                                        },
                                        {
                                            value: 'cunningham_1980',
                                            label: 'Cunningham 1980',
                                            desc: 'Foca no tecido metabolicamente ativo. Para endurance/força.'
                                        },
                                        {
                                            value: 'tinsley_2018_lbm',
                                            label: 'Tinsley 2018 (Massa Magra)',
                                            desc: 'Alta precisão para musculação/physique usando composição corporal.'
                                        },
                                        {
                                            value: 'fao_who_2004',
                                            label: 'FAO/WHO 2004',
                                            desc: 'Robusta para crianças, adolescentes e idosos.'
                                        },
                                        {
                                            value: 'eer_iom_2005',
                                            label: 'EER/IOM 2005',
                                            desc: 'D.R.I. Calcula o Gasto Energético Total diretamente.'
                                        },
                                        {
                                            value: 'eer_iom_2023',
                                            label: 'EER/IOM 2023',
                                            desc: 'Atualização mais recente das DRIs.'
                                        },
                                    ].map((option) => (
                                        <div key={option.value} className="relative group/item w-full">
                                            <DropdownMenuItem
                                                onClick={() => setCalculationMethod(option.value as any)}
                                                className="flex flex-col items-start py-2.5 px-4 cursor-pointer focus:bg-primary/10 w-full"
                                            >
                                                <div className="flex flex-col w-full gap-0.5">
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                    <span className="text-[10px] text-muted-foreground opacity-70 group-hover/item:opacity-100 transition-opacity leading-tight max-w-[240px]">
                                                        {option.desc}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        </div>
                                    ))}
                                </Selector>

                                <Selector
                                    icon={Dna}
                                    label={
                                        dietType === 'personalizada'
                                            ? 'DIETA PERSONALIZADA'
                                            : (DIET_TYPE_MACROS[dietType]?.label || 'ESTRATÉGIA').toUpperCase()
                                    }
                                    subLabel={
                                        dietType === 'personalizada'
                                            ? `60/25/15%`
                                            : `${DIET_TYPE_MACROS[dietType]?.carbs}/${DIET_TYPE_MACROS[dietType]?.protein}/${DIET_TYPE_MACROS[dietType]?.fats}%`
                                    }
                                >
                                    {[
                                        { key: 'normocalorica', desc: 'Equilíbrio padrão. Ideal para manutenção e saúde geral.' },
                                        { key: 'low_carb', desc: 'Redução de carboidratos. Foco em controle glicêmico e peso.' },
                                        { key: 'high_carb', desc: 'Alto carboidrato. Ideal para atletas de endurance e alta performance.' },
                                        { key: 'cetogenica', desc: 'Carboidratos mínimos (<50g). Induz cetose para queima de gordura.' },
                                        { key: 'hiperproteica', desc: 'Foco em proteínas. Ótima para ganho de massa e saciedade.' },
                                        { key: 'mediterranea', desc: 'Foco em gorduras saudáveis, azeite, castanhas e vegetais.' },
                                        { key: 'vegetariana', desc: 'Sem carnes. Baseada em vegetais, ovos e laticínios.' },
                                        { key: 'vegana', desc: 'Estrita. Zero produtos de origem animal.' },
                                        { key: 'sem_gluten', desc: 'Exclusão de trigo/glúten. Para celíacos ou sensibilidade.' },
                                    ].map((option) => {
                                        const data = DIET_TYPE_MACROS[option.key as DietType];
                                        if (!data) return null;
                                        return (
                                            <div key={option.key} className="relative group/item w-full">
                                                <DropdownMenuItem
                                                    onClick={() => setDietType(option.key as DietType)}
                                                    className="flex flex-col items-start py-2.5 px-4 cursor-pointer focus:bg-primary/10 w-full"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="text-sm font-medium">{data.label}</span>
                                                        <Badge variant="outline" className="text-[9px] opacity-60 ml-2 border-border/50">
                                                            {data.carbs}/{data.protein}/{data.fats}%
                                                        </Badge>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground opacity-70 group-hover/item:opacity-100 transition-opacity leading-tight max-w-[240px mt-0.5">
                                                        {option.desc}
                                                    </span>
                                                </DropdownMenuItem>
                                            </div>
                                        )
                                    })}

                                    <div className="relative group/item w-full">
                                        <DropdownMenuItem onClick={() => setDietType('personalizada')} className="flex flex-col items-start py-2.5 px-4 cursor-pointer focus:bg-primary/10 w-full">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-sm font-medium">Personalizada</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground opacity-70 group-hover/item:opacity-100 transition-opacity leading-tight max-w-[240px] mt-0.5">
                                                Defina manualmente suas metas de macros.
                                            </span>
                                        </DropdownMenuItem>
                                    </div>
                                </Selector>
                            </div>
                        </div>
                    </div>

                    {/* ROW 2: Metabolic Dashboard */}
                    <Card variant="glass" className="py-5 px-6 flex flex-col lg:flex-row items-center gap-8 shadow-xl">

                        {/* Metabolic Targets */}
                        <div className="flex items-center gap-10 px-4 lg:border-r border-border/20">
                            <MetricBox label="TMB" value={Math.round(tmb)} unit="kcal" icon={Activity} iconColor="text-emerald-500" />
                            <MetricBox label="GCD" value={Math.round(get)} unit="kcal" icon={Flame} iconColor="text-red-500" />
                            <MetricBox label="META" value={targetCalories} unit="kcal" icon={Target} highlight />
                        </div>

                        {/* Activity Selector */}
                        <div className="lg:border-r border-border/20 px-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex flex-col items-start gap-1 p-2.5 rounded-xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/20">
                                        <span className="text-data-label">Nível de Atividade</span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Activity className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-base text-foreground">
                                                {ACTIVITY_LEVELS.find(l => l.value === activityLevel)?.label || activityLevel}
                                            </span>
                                            <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="p-1">
                                    {ACTIVITY_LEVELS.map(level => (
                                        <DropdownMenuItem key={level.value} onClick={() => setActivityLevel(level.value)} className="py-2.5 px-4 cursor-pointer focus:bg-primary/10">
                                            {level.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Live Macro Monitor */}
                        <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-6 px-2">
                            <MacroMonitor data={proteinData} color="bg-emerald-500" textColor="text-emerald-500" />
                            <MacroMonitor data={carbsData} color="bg-blue-500" textColor="text-blue-500" />
                            <MacroMonitor data={fatsData} color="bg-orange-500" textColor="text-orange-500" />
                            <MacroMonitor data={fiberData} color="bg-purple-500" textColor="text-purple-500" />
                        </div>

                    </Card>

                </div>

                {/* HUB NAVIGATION AREA */}
                <div className="absolute bottom-0 left-0 w-full z-50 flex justify-center -mb-7">
                    <HubNavigation />
                </div>

                {isCommandPaletteOpen && (
                    <NavigationCommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                    />
                )}
            </div>
        </>
    )
}

function MetricBox({ label, value, unit, icon: Icon, highlight, iconColor }: any) {
    return (
        <div className={`flex flex-col items-center min-w-20 transition-transform ${highlight ? 'scale-110' : ''}`}>
            <span className="text-data-label mb-1.5 flex items-center gap-2">
                {Icon && <Icon className={cn("h-4 w-4", highlight ? "text-primary" : iconColor ? iconColor : "text-muted-foreground")} />}
                {label}
            </span>
            <div className={cn("text-h1 text-3xl tracking-tighter tabular-nums", highlight ? "text-foreground" : "text-foreground")}>
                {value}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{unit}</span>
        </div>
    )
}

function Selector({ icon: Icon, label, subLabel, children }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card border border-border/50 hover:border-primary/40 transition-all group min-w-40">
                    <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate w-full uppercase tracking-tighter">
                            {label}
                        </span>
                        {subLabel && (
                            <span className="text-[9px] font-medium text-primary -mt-0.5 opacity-70">
                                {subLabel}
                            </span>
                        )}
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-20 ml-auto" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] p-1 shadow-2xl border-white/10 backdrop-blur-xl">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MacroMonitor({ data, color, textColor }: any) {
    return (
        <div className="flex flex-col gap-2 group">
            {/* Header com Label e Alvos */}
            <div className="flex items-center justify-between">
                <span className={cn("text-[10px] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity", textColor)}>
                    {data.label}
                </span>

                <div className="flex items-center gap-1">
                    <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] tracking-tighter",
                        data.diff > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                        {data.diff > 0 ? '+' : ''}{data.diff}g
                    </span>
                </div>
            </div>

            {/* Valores Principais */}
            <div className="flex items-end justify-between -mt-1">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl text-foreground tabular-nums leading-none">
                        {Math.round(data.current)}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums opacity-40">
                        / {Math.round(data.target)}g
                    </span>
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums opacity-60">
                    {data.perKg}g/kg
                </span>
            </div>

            {/* Progress Bar Progressiva */}
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden relative shadow-inner group-hover:bg-muted/50 transition-colors">
                <motion.div
                    className={cn("absolute left-0 top-0 bottom-0 shadow-lg", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>
        </div>
    )
}

// --- CIRCULAR CHART COMPONENT ---
function CircularMacroChart({ totals, targets, targetCalories }: any) {
    const size = 130
    const strokeWidth = 12
    const center = size / 2
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const totalGrams = totals.protein + totals.carbs + totals.fats
    const safeTotal = totalGrams || 1

    const proteinPct = (totals.protein / safeTotal) * 100
    const carbsPct = (totals.carbs / safeTotal) * 100
    const fatsPct = (totals.fats / safeTotal) * 100

    const proteinDash = (proteinPct / 100) * circumference
    const carbsDash = (carbsPct / 100) * circumference
    const fatsDash = (fatsPct / 100) * circumference

    return (
        <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={center} cy={center} r={radius} className="stroke-border dark:stroke-gray-300" strokeWidth={strokeWidth} fill="none" />

                    {totals.protein > 0 && (
                        <motion.circle cx={center} cy={center} r={radius} className="stroke-emerald-500" strokeWidth={strokeWidth}
                            strokeDasharray={`${proteinDash} ${circumference}`} strokeDashoffset={0} strokeLinecap="round" fill="none"
                            initial={{ strokeDasharray: `0 ${circumference}` }} animate={{ strokeDasharray: `${proteinDash} ${circumference}` }} />
                    )}
                    {totals.carbs > 0 && (
                        <motion.circle cx={center} cy={center} r={radius} className="stroke-blue-500" strokeWidth={strokeWidth}
                            strokeDasharray={`${carbsDash} ${circumference}`} strokeDashoffset={-proteinDash} strokeLinecap="round" fill="none"
                            initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                            animate={{ strokeDasharray: `${carbsDash} ${circumference}`, strokeDashoffset: -proteinDash }} />
                    )}
                    {totals.fats > 0 && (
                        <motion.circle cx={center} cy={center} r={radius} className="stroke-orange-500" strokeWidth={strokeWidth}
                            strokeDasharray={`${fatsDash} ${circumference}`} strokeDashoffset={-(proteinDash + carbsDash)} strokeLinecap="round" fill="none"
                            initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                            animate={{ strokeDasharray: `${fatsDash} ${circumference}`, strokeDashoffset: -(proteinDash + carbsDash) }} />
                    )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Target className="h-6 w-6 text-primary opacity-20" />
                </div>
            </div>

            <div className="flex flex-col min-w-[120px]">
                <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Calórico</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl text-foreground tabular-nums leading-none">{Math.round(totals.calories)}</span>
                        <span className="text-sm text-muted-foreground opacity-50 tracking-tighter">/ {targetCalories}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MacroLegendItem({ color, label, value }: any) {
    return (
        <div className="flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-2.5">
                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", color)} />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-sm text-foreground tabular-nums">{Math.round(value)}g</span>
        </div>
    )
}
