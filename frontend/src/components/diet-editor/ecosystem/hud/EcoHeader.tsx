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
    Users
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
    useDietEditorStore,
    useDietEditorPatient,
    useDietEditorMeals,
    CalculationMethod,
    DietType,
    ACTIVITY_LEVELS,
    DIET_TYPE_MACROS
} from '@/stores/diet-editor-store'
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

// Mock Patients
const MOCK_PATIENTS = [
    { id: 1, name: 'João Silva', age: 32, weight: 78, height: 1.78, sex: 'M', goal: 'Hipertrofia', objective: 'Ganho de Massa' },
    { id: 2, name: 'Maria Oliveira', age: 28, weight: 62, height: 1.65, sex: 'F', goal: 'Emagrecimento', objective: 'Perda de Gordura' },
    { id: 3, name: 'Carlos Santos', age: 45, weight: 92, height: 1.82, sex: 'M', goal: 'Manutenção', objective: 'Saúde Geral' },
]

export function EcoHeader() {
    const patient = useDietEditorPatient()
    const meals = useDietEditorMeals()

    // Global Navigation State
    const activeTab = useDietEditorStore(state => state.activeTab)
    const setActiveTab = useDietEditorStore(state => state.setActiveTab)

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
        })
        return acc
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 })

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

    return (
        <div className="relative mb-2 bg-background z-40 shadow-sm border-b border-border/10 pb-6">
            {/* Background Banner (Style from PatientHeader) */}
            <div className="h-28 w-full bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                {/* Back Button positioned on the banner */}
                <button
                    onClick={() => window.history.back()}
                    className="absolute top-4 left-6 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all backdrop-blur-sm z-10"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            </div>

            {/* FLOATING CIRCULAR GRAPH */}
            <div className="absolute left-1/2 -translate-x-1/2 top-28 -translate-y-1/2 z-50">
                <CircularMacroChart
                    totals={currentTotals}
                    targets={targetMacros}
                    targetCalories={targetCalories}
                />
            </div>

            <div className="px-6 md:px-8 -mt-10 flex flex-col gap-6">

                {/* ROW 1: Profile & Actions */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-6">

                    {/* Avatar (Overlapping) with Selector */}
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-white/10 filter drop-shadow-lg cursor-pointer transition-transform group-hover:scale-105">
                            <AvatarImage src={patient?.photo} />
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                                {patient?.name?.substring(0, 2).toUpperCase() || <Users className="h-8 w-8 opacity-50" />}
                            </AvatarFallback>
                        </Avatar>

                        {/* Patient Switching Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium text-xs backdrop-blur-sm">
                                    Trocar
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[260px]">
                                <DropdownMenuLabel>Selecionar Paciente</DropdownMenuLabel>
                                <div className="px-2 py-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                        <Input placeholder="Buscar..." className="h-8 pl-8 text-xs bg-muted/50" />
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                {MOCK_PATIENTS.map(p => (
                                    <DropdownMenuItem
                                        key={p.id}
                                        onClick={() => setPatient(p as any)}
                                        className="flex flex-col items-start cursor-pointer py-2 focus:bg-primary/5"
                                    >
                                        <span className="font-medium">{p.name}</span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <span>{p.objective}</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span>{p.weight}kg</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Badge className="absolute bottom-1 right-1 border-2 border-background bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 pointer-events-none">
                            Ativo
                        </Badge>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1 mb-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {patient?.name || 'Novo Paciente'}
                            </h1>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-muted-foreground font-normal bg-background/50">
                                    {patient?.age || '--'} anos
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground font-normal bg-background/50">
                                    {patient?.weight || '--'} kg
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground font-normal bg-background/50">
                                    {patient?.height || '--'}m
                                </Badge>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-indigo-400" />
                                Hipertrofia
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-emerald-400">Adesão Presumida: 90%</span>
                        </div>
                    </div>

                    {/* Actions & Strategies (Right Side) */}
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        {/* Buttons (Profile Style) */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 gap-2 border-amber-500/20 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10">
                                <FileText className="h-3.5 w-3.5" />
                                PDF
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-2 border-blue-500/20 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                                <Smartphone className="h-3.5 w-3.5" />
                                App
                            </Button>
                        </div>

                        {/* Selectors */}
                        <div className="flex gap-2">
                            <Selector
                                icon={Calculator}
                                label={calculationMethod.replace('mifflin', 'Mifflin').replace('_', ' ')}
                                color="text-slate-400"
                            >
                                <DropdownMenuItem onClick={() => setCalculationMethod('mifflin')}>Mifflin-St Jeor</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCalculationMethod('harris_benedict')}>Harris-Benedict</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setCalculationMethod('cunningham')}>Cunningham</DropdownMenuItem>
                            </Selector>

                            <Selector
                                icon={Dna}
                                label={DIET_TYPE_MACROS[dietType]?.label || 'Personalizada'}
                                color="text-purple-400"
                            >
                                {Object.entries(DIET_TYPE_MACROS).map(([key, data]) => (
                                    <DropdownMenuItem key={key} onClick={() => setDietType(key as DietType)}>
                                        {data.label}
                                    </DropdownMenuItem>
                                ))}
                            </Selector>
                        </div>
                    </div>
                </div>

                {/* ROW 2: Metabolic Dashboard (Card Style) */}
                <div className="bg-muted/30 border border-border/40 rounded-2xl p-4 flex flex-col lg:flex-row items-center gap-6 shadow-sm">

                    {/* Metabolic Targets */}
                    <div className="flex items-center gap-8 px-4 lg:border-r border-border/10">
                        <MetricBox label="TMB" value={Math.round(tmb)} unit="kcal" icon={Activity} color="text-slate-400" />
                        <MetricBox label="GCD" value={Math.round(get)} unit="kcal" icon={Flame} color="text-orange-400" />
                        <MetricBox label="Meta" value={targetCalories} unit="kcal" icon={Target} color="text-emerald-400" highlight />
                    </div>

                    {/* Activity Selector (Inline) */}
                    <div className="lg:border-r border-border/10 px-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex flex-col items-start gap-1 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Nível de Atividade</span>
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium text-foreground">
                                            {ACTIVITY_LEVELS.find(l => l.value === activityLevel)?.label || activityLevel}
                                        </span>
                                        <ChevronDown className="h-3 w-3 opacity-30" />
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {ACTIVITY_LEVELS.map(level => (
                                    <DropdownMenuItem key={level.value} onClick={() => setActivityLevel(level.value)}>
                                        {level.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Live Macro Monitor */}
                    <div className="flex-1 w-full grid grid-cols-3 gap-4 px-2">
                        <MacroMonitor data={proteinData} color="bg-emerald-500" textColor="text-emerald-500" />
                        <MacroMonitor data={carbsData} color="bg-blue-500" textColor="text-blue-500" />
                        <MacroMonitor data={fatsData} color="bg-amber-500" textColor="text-amber-500" />
                    </div>

                </div>

            </div>

            {/* NAVIGATION TABS (Patient Profile Style, Absolute Position) */}
            <div className="absolute bottom-[-23.5px] left-0 w-full z-50 px-6 md:px-8 translate-y-1/2">
                <Tabs value={activeTab || ''} className="w-full shadow-2xl drop-shadow-2xl">
                    <TabsList className="grid w-full grid-cols-5 bg-background border border-border/50 p-1 rounded-xl shadow-sm h-auto">
                        <TabsTrigger
                            value="overview"
                            onClick={(e) => { e.preventDefault(); activeTab === 'overview' ? setActiveTab('') : setActiveTab('overview') }}
                            className="text-xs md:text-sm py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Visão Geral</TabsTrigger>
                        <TabsTrigger
                            value="context"
                            onClick={(e) => { e.preventDefault(); activeTab === 'context' ? setActiveTab('') : setActiveTab('context') }}
                            className="text-xs md:text-sm py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Contexto</TabsTrigger>
                        <TabsTrigger
                            value="analysis"
                            onClick={(e) => { e.preventDefault(); activeTab === 'analysis' ? setActiveTab('') : setActiveTab('analysis') }}
                            className="text-xs md:text-sm py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Análise</TabsTrigger>
                        <TabsTrigger
                            value="diet"
                            onClick={(e) => { e.preventDefault(); activeTab === 'diet' ? setActiveTab('') : setActiveTab('diet') }}
                            className="text-xs md:text-sm py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Dieta</TabsTrigger>
                        <TabsTrigger
                            value="anamnesis"
                            onClick={(e) => { e.preventDefault(); activeTab === 'anamnesis' ? setActiveTab('') : setActiveTab('anamnesis') }}
                            className="text-xs md:text-sm py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-all duration-300"
                        >Anamnese</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

        </div>
    )
}

function MetricBox({ label, value, unit, icon: Icon, color, highlight }: any) {
    return (
        <div className={`flex flex-col items-center min-w-[70px] ${highlight ? 'scale-110' : ''}`}>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                {Icon && <Icon className={`h-3 w-3 ${color}`} />}
                {label}
            </span>
            <NeonText className={`text-xl ${highlight ? 'text-foreground' : 'text-muted-foreground'}`}>
                {value}
            </NeonText>
            <span className="text-[9px] text-muted-foreground font-mono">{unit}</span>
        </div>
    )
}

function Selector({ icon: Icon, label, color, children }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border transition-all group">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors max-w-[100px] truncate">
                        {label}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-30" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MacroMonitor({ data, color, textColor }: any) {
    return (
        <div className="flex flex-col justify-center">
            <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-baseline gap-1">
                    <span className={`text-xs font-bold ${textColor}`}>{data.label.substring(0, 3)}</span>
                    <span className="text-sm font-bold text-foreground">{Math.round(data.current)}g</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-mono opacity-80">
                    <span className="text-muted-foreground">({data.perKg})</span>
                    <span className={`${data.diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {data.diff > 0 ? '+' : ''}{data.diff}
                    </span>
                </div>
            </div>

            <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
                <motion.div
                    className={`absolute left-0 top-0 bottom-0 ${color}`}
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
    const size = 110
    const strokeWidth = 10
    const center = size / 2
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    // Calculate distribution based on current intake
    const totalGrams = totals.protein + totals.carbs + totals.fats
    const safeTotal = totalGrams || 1

    const proteinPct = (totals.protein / safeTotal) * 100
    const carbsPct = (totals.carbs / safeTotal) * 100
    const fatsPct = (totals.fats / safeTotal) * 100

    // Calculate segment lengths
    const proteinDash = (proteinPct / 100) * circumference
    const carbsDash = (carbsPct / 100) * circumference
    const fatsDash = (fatsPct / 100) * circumference

    return (
        <div className="flex items-center gap-4">
            {/* 1. The Donut Graph (Left) */}
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={center} cy={center} r={radius} className="stroke-muted/20" strokeWidth={strokeWidth} fill="none" />

                    {totals.protein > 0 && (
                        <motion.circle cx={center} cy={center} r={radius} className="stroke-emerald-500" strokeWidth={strokeWidth}
                            strokeDasharray={`${proteinDash} ${circumference}`} strokeDashoffset={0} fill="none"
                            initial={{ strokeDasharray: `0 ${circumference}` }} animate={{ strokeDasharray: `${proteinDash} ${circumference}` }} />
                    )}
                    {totals.carbs > 0 && (
                        <motion.circle cx={center} cy={center} r={radius} className="stroke-blue-500" strokeWidth={strokeWidth}
                            strokeDasharray={`${carbsDash} ${circumference}`} strokeDashoffset={-proteinDash} fill="none"
                            initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                            animate={{ strokeDasharray: `${carbsDash} ${circumference}`, strokeDashoffset: -proteinDash }} />
                    )}
                    {totals.fats > 0 && (
                        <motion.circle cx={center} cy={center} r={radius} className="stroke-amber-500" strokeWidth={strokeWidth}
                            strokeDasharray={`${fatsDash} ${circumference}`} strokeDashoffset={-(proteinDash + carbsDash)} fill="none"
                            initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }}
                            animate={{ strokeDasharray: `${fatsDash} ${circumference}`, strokeDashoffset: -(proteinDash + carbsDash) }} />
                    )}
                </svg>
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Target className="h-5 w-5 text-muted-foreground/30" />
                </div>
            </div>

            {/* 2. Legend & Totals (Right) - Stacked vertically */}
            <div className="flex flex-col gap-2.5 pr-4 translate-y-[15.5px]">

                {/* Legend Stack */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground w-6">PTN</span>
                        <span className="font-bold text-foreground">{Math.round(totals.protein)}g</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground w-6">CHO</span>
                        <span className="font-bold text-foreground">{Math.round(totals.carbs)}g</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground w-6">FAT</span>
                        <span className="font-bold text-foreground">{Math.round(totals.fats)}g</span>
                    </div>
                </div>

                <div className="h-px bg-border/50 w-full" />

                {/* Total Calories */}
                <div className="flex items-baseline gap-1.5">
                    <NeonText className="text-xl font-bold leading-none">{Math.round(totals.calories)}</NeonText>
                    <span className="text-[10px] text-muted-foreground font-mono">/ {targetCalories} kcal</span>
                </div>
            </div>
        </div>
    )
}
