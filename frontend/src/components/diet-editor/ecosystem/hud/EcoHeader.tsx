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
    useDietEditorStore as useStore,
    useDietEditorMeals,
    CalculationMethod,
    DietType,
    ACTIVITY_LEVELS,
    DIET_TYPE_MACROS
} from '@/stores/diet-editor-store'
import { NavigationCommandPalette } from './NavigationCommandPalette'
import { HubNavigation } from './HubNavigation'
import patientService from '@/services/patient-service'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function EcoHeader() {
    const patient = useDietEditorPatient()
    const meals = useDietEditorMeals()

    // Name Abbreviation Logic
    const formatPatientName = (name: string) => {
        if (!name) return 'Novo Paciente'
        const parts = name.trim().split(/\s+/)
        if (parts.length <= 2) return name
        const first = parts[0]
        const last = parts[parts.length - 1]
        const middles = parts.slice(1, -1).map(p => p[0].toUpperCase() + '.')
        return `${first} ${middles.join(' ')} ${last}`
    }

    // Patient Search State
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<any[]>([])
    const [isSearching, setIsSearching] = React.useState(false)

    React.useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([])
            return
        }
        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                const results = await patientService.search(searchQuery)
                setSearchResults(results)
            } catch (err) {
                console.error("Error searching patients:", err)
            } finally {
                setIsSearching(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

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
        targetMacros,
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
                    <Link
                        href="/diets"
                        className="absolute top-6 left-4 p-2 rounded-full bg-background text-foreground hover:bg-background hover:text-foreground transition-all backdrop-blur-sm z-10 border border-border opacity-80 hover:opacity-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </div>

                {/* FLOATING CIRCULAR GRAPH + TOTAL CALÓRICO */}
                <div className="absolute left-1/2 md:left-[60%] -translate-x-1/2 top-20 -translate-y-1/2 z-50 transition-all duration-500 flex items-center gap-6">
                    <CircularMacroChart
                        totals={currentTotals}
                        targets={targetMacros}
                        targetCalories={targetCalories}
                        hideText
                    />
                    <div className="flex flex-col mt-[15px]">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Total Calórico</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
                                {Math.round(currentTotals.calories)}
                            </span>
                            <span className="text-sm text-muted-foreground opacity-40">/ {targetCalories}</span>
                        </div>
                    </div>
                </div>

                <div className="px-6 md:px-10 -mt-8 flex flex-col gap-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 overflow-hidden">
                                <AvatarImage src={patient?.avatar} className="h-full w-full object-cover" />
                                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                    {patient?.name?.substring(0, 2).toUpperCase() || <Users className="h-10 w-10 opacity-50" />}
                                </AvatarFallback>
                            </Avatar>
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
                                            <Input
                                                placeholder="Buscar por nome..."
                                                className="h-10 pl-10 text-sm bg-muted/50"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    {isSearching && <div className="px-4 py-3 text-xs text-muted-foreground text-center italic">Buscando...</div>}
                                    {searchResults.map(p => (
                                        <DropdownMenuItem key={p.id} onClick={() => { setPatient(p as any); setSearchQuery(""); setSearchResults([]); }} className="flex items-center gap-3 py-3 px-4 focus:bg-primary/10 cursor-pointer">
                                            <Avatar className="h-8 w-8 border border-border/50">
                                                <AvatarImage src={p.avatar} className="object-cover" />
                                                <AvatarFallback className="text-[10px] bg-primary/5 text-primary">{p.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium leading-none">{p.name}</span>
                                                <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">ID: {p.id}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Badge className="absolute bottom-2 right-2 border-2 border-background bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 shadow-lg">Ativo</Badge>
                        </div>

                        <div className="flex-1 space-y-3 mb-2 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <h1 className="text-3xl font-bold tracking-tight truncate max-w-[280px] md:max-w-[350px]" title={patient?.name}>
                                    {formatPatientName(patient?.name || '')}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex gap-2">
                                        <Selector
                                            icon={Utensils}
                                            label={
                                                (
                                                    {
                                                        'harris_benedict_1919': 'Harris-Benedict 1919',
                                                        'harris_benedict_1984': 'Harris-Benedict 1984',
                                                        'mifflin_1990': 'Mifflin-St Jeor 1990',
                                                        'katch_mcardle_1996': 'Katch-McArdle 1996',
                                                        'cunningham_1980': 'Cunningham 1980',
                                                        'fao_who_2004': 'FAO/WHO 2004',
                                                        'eer_iom_2005': 'EER/IOM 2005',
                                                        'eer_iom_2023': 'EER/IOM 2023',
                                                        'henry_rees_1991': 'Henry & Rees 1991',
                                                        'tinsley_2018_weight': 'Tinsley 2018 (Peso)',
                                                        'tinsley_2018_lbm': 'Tinsley 2018 (Massa Magra)'
                                                    } as Record<string, string>
                                                )[calculationMethod] || calculationMethod || 'Mifflin-St Jeor 1990'
                                            }
                                        >
                                            {[
                                                { value: 'mifflin_1990', label: 'Mifflin-St Jeor 1990', desc: 'Padrão-ouro atual.' },
                                                { value: 'katch_mcardle_1996', label: 'Katch-McArdle 1996', desc: 'Foco em Massa Magra.' },
                                                { value: 'harris_benedict_1984', label: 'Harris-Benedict 1984', desc: 'Equação revisada.' },
                                            ].map((option) => (
                                                <DropdownMenuItem key={option.value} onClick={() => setCalculationMethod(option.value as any)} className="flex flex-col items-start py-2 px-4 cursor-pointer focus:bg-primary/10">
                                                    <span className="text-sm font-medium">{option.label}</span>
                                                    <span className="text-[10px] text-muted-foreground leading-tight">{option.desc}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </Selector>
                                        <Selector
                                            icon={Dna}
                                            label={dietType === 'personalizada' ? 'PERSONALIZADA' : (DIET_TYPE_MACROS[dietType]?.label || 'ESTRATÉGIA').toUpperCase()}
                                            subLabel={dietType === 'personalizada' ? 'MANUAL' : `${DIET_TYPE_MACROS[dietType]?.carbs}/${DIET_TYPE_MACROS[dietType]?.protein}/${DIET_TYPE_MACROS[dietType]?.fats}%`}
                                        >
                                            {Object.keys(DIET_TYPE_MACROS).map((key) => {
                                                const data = DIET_TYPE_MACROS[key as DietType];
                                                return (
                                                    <DropdownMenuItem key={key} onClick={() => setDietType(key as DietType)} className="flex flex-col items-start py-2 px-4 cursor-pointer focus:bg-primary/10">
                                                        <div className="flex items-center justify-between w-full">
                                                            <span className="text-sm font-medium">{data.label}</span>
                                                            <Badge variant="outline" className="text-[9px] opacity-60 ml-2">{data.carbs}/{data.protein}/{data.fats}%</Badge>
                                                        </div>
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                            <DropdownMenuItem onClick={() => setDietType('personalizada')} className="flex flex-col items-start py-2 px-4 cursor-pointer focus:bg-primary/10">
                                                <span className="text-sm font-medium">Personalizada</span>
                                            </DropdownMenuItem>
                                        </Selector>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="h-8 gap-2 rounded-xl text-[10px] uppercase tracking-widest text-muted-foreground border-border/50">
                                            <FileText className="h-3.5 w-3.5 text-amber-500" /> PDF
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 gap-2 rounded-xl text-[10px] uppercase tracking-widest text-muted-foreground border-border/50">
                                            <Smartphone className="h-3.5 w-3.5 text-primary" /> App
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                                        <Target className="h-4 w-4 text-primary" />
                                        <span className="uppercase tracking-wider text-[11px] font-medium">{patient?.goal || 'Objetivo'}</span>
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                    <span className="text-emerald-500 text-xs uppercase tracking-tight font-medium">Ativo</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                    <span className="text-primary text-xs uppercase tracking-tight font-medium">IMC: {patient?.weight && patient?.height ? (patient.weight / (patient.height * patient.height)).toFixed(1) : '--'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="bg-background/50 px-3 h-7 border-border/40 whitespace-nowrap text-muted-foreground">{patient?.age || '--'} anos</Badge>
                                    <Badge variant="outline" className="bg-background/50 px-3 h-7 border-border/40 whitespace-nowrap text-muted-foreground">{patient?.weight || '--'} kg</Badge>
                                    <Badge variant="outline" className="bg-background/50 px-3 h-7 border-border/40 whitespace-nowrap text-muted-foreground">{patient?.height ? `${Math.round(patient.height * 100)} cm` : '--'}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card variant="glass" className="w-full max-w-[1600px] mx-auto py-5 px-6 flex flex-col lg:flex-row items-center gap-8 shadow-xl">
                <div className="flex items-center gap-10 px-4 lg:border-r border-border/20">
                    <MetricBox label="TMB" value={Math.round(tmb)} unit="kcal" icon={Activity} iconColor="text-emerald-500" />
                    <MetricBox label="GCD" value={Math.round(get)} unit="kcal" icon={Flame} iconColor="text-red-500" />
                    <MetricBox label="META" value={targetCalories} unit="kcal" icon={Target} highlight />
                </div>
                <div className="lg:border-r border-border/20 px-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex flex-col items-start gap-1 p-2.5 rounded-xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/20">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Nível de Atividade</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Activity className="h-5 w-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-base text-foreground font-medium">{ACTIVITY_LEVELS.find(l => l.value === activityLevel)?.label || activityLevel}</span>
                                    <ChevronDown className="h-3.5 w-3.5 opacity-30" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="p-1">
                            {ACTIVITY_LEVELS.map(level => (
                                <DropdownMenuItem key={level.value} onClick={() => setActivityLevel(level.value)} className="py-2.5 px-4 cursor-pointer focus:bg-primary/10">{level.label}</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-6 px-2">
                    <MacroMonitor data={proteinData} color="bg-emerald-500" textColor="text-emerald-500" />
                    <MacroMonitor data={carbsData} color="bg-blue-500" textColor="text-blue-500" />
                    <MacroMonitor data={fatsData} color="bg-orange-500" textColor="text-orange-500" />
                    <MacroMonitor data={fiberData} color="bg-purple-500" textColor="text-purple-500" />
                </div>
            </Card>

            <div className="absolute bottom-0 left-0 w-full z-50 flex justify-center -mb-7 translate-y-[24px]">
                <HubNavigation />
            </div>
        </>
    )
}

function MetricBox({ label, value, unit, icon: Icon, highlight, iconColor }: any) {
    return (
        <div className={cn("flex flex-col items-center min-w-20 transition-transform", highlight && "scale-110")}>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-2">
                {Icon && <Icon className={cn("h-4 w-4", highlight ? "text-primary" : iconColor || "text-muted-foreground")} />}
                {label}
            </span>
            <div className="text-3xl font-bold tracking-tighter tabular-nums text-foreground">{value}</div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{unit}</span>
        </div>
    )
}

function Selector({ icon: Icon, label, subLabel, children }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all group min-w-40 h-[42px]">
                    <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors truncate w-full uppercase tracking-tighter font-bold">{label}</span>
                        {subLabel && <span className="text-[9px] font-bold text-primary -mt-0.5 opacity-70">{subLabel}</span>}
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
            <div className="flex items-center justify-between">
                <span className={cn("text-[10px] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity font-bold", textColor)}>{data.label}</span>
                <div className="flex items-center gap-1">
                    <span className={cn("px-1.5 py-0.5 rounded-md text-[9px] tracking-tighter font-bold", data.diff > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500')}>
                        {data.diff > 0 ? '+' : ''}{data.diff}g
                    </span>
                </div>
            </div>
            <div className="flex items-end justify-between -mt-1">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-foreground tabular-nums leading-none">{Math.round(data.current)}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums opacity-40">/ {Math.round(data.target)}g</span>
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums opacity-60">{data.perKg}g/kg</span>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden relative shadow-inner group-hover:bg-muted/50 transition-colors">
                <motion.div className={cn("absolute left-0 top-0 bottom-0 shadow-lg", color)} initial={{ width: 0 }} animate={{ width: `${data.progress}%` }} transition={{ type: "spring", stiffness: 100, damping: 20 }} />
            </div>
        </div>
    )
}

function CircularMacroChart({ totals, targets, targetCalories, hideText }: any) {
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
                    {totals.protein > 0 && <motion.circle cx={center} cy={center} r={radius} className="stroke-emerald-500" strokeWidth={strokeWidth} strokeDasharray={`${proteinDash} ${circumference}`} strokeDashoffset={0} strokeLinecap="round" fill="none" initial={{ strokeDasharray: `0 ${circumference}` }} animate={{ strokeDasharray: `${proteinDash} ${circumference}` }} />}
                    {totals.carbs > 0 && <motion.circle cx={center} cy={center} r={radius} className="stroke-blue-500" strokeWidth={strokeWidth} strokeDasharray={`${carbsDash} ${circumference}`} strokeDashoffset={-proteinDash} strokeLinecap="round" fill="none" initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }} animate={{ strokeDasharray: `${carbsDash} ${circumference}`, strokeDashoffset: -proteinDash }} />}
                    {totals.fats > 0 && <motion.circle cx={center} cy={center} r={radius} className="stroke-orange-500" strokeWidth={strokeWidth} strokeDasharray={`${fatsDash} ${circumference}`} strokeDashoffset={-(proteinDash + carbsDash)} strokeLinecap="round" fill="none" initial={{ strokeDasharray: `0 ${circumference}`, strokeDashoffset: 0 }} animate={{ strokeDasharray: `${fatsDash} ${circumference}`, strokeDashoffset: -(proteinDash + carbsDash) }} />}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Target className="h-6 w-6 text-primary opacity-20" /></div>
            </div>
            {!hideText && (
                <div className="flex flex-col min-w-[120px]">
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Calórico</p>
                        <div className="flex items-baseline gap-2"><span className="text-4xl font-bold text-foreground tabular-nums leading-none">{Math.round(totals.calories)}</span><span className="text-sm text-muted-foreground opacity-50 tracking-tighter">/ {targetCalories}</span></div>
                    </div>
                </div>
            )}
        </div>
    )
}
