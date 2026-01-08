"use client"

import React, { useState, useRef, useEffect } from 'react'
import {
    X,
    Download,
    Printer,
    FileText,
    Check,
    Loader2,
    Smartphone,
    Calendar,
    Utensils,
    MapPin,
    Phone,
    UserCircle2,
    Flame,
    Zap,
    Target,
    Activity,
    ShieldCheck
} from 'lucide-react'
import {
    useDietEditorStore,
    useDietEditorMeals,
    useDietEditorPatient,
    DIET_TYPE_MACROS,
    WorkspaceMeal,
    WorkspaceMealFood
} from '@/stores/diet-editor-store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { settingsService } from '@/services/settings-service'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PDFPreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PDFPreviewModal({ open, onOpenChange }: PDFPreviewModalProps) {
    const [isSending, setIsSending] = useState(false)
    const [sendSuccess, setSendSuccess] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [nutritionist, setNutritionist] = useState<any>(null)

    const {
        dietType,
        targetCalories,
        targetMacros,
        activeTab,
        workspaceMeals,
        goalAdjustment,
        tmb,
        get
    } = useDietEditorStore()
    const patient = useDietEditorPatient()
    const weekPlanMeals = useDietEditorMeals()
    const contentRef = useRef<HTMLDivElement>(null)

    // Fetch Nutritionist Data
    useEffect(() => {
        if (open) {
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
        }
    }, [open])

    // Determine which meals to show based on context
    const mealsToDisplay = React.useMemo(() => {
        if (!activeTab || activeTab === 'diet') {
            // Map workspaceMeals to a compatible display format
            return workspaceMeals.map(meal => ({
                id: String(meal.id),
                name: meal.type,
                time: meal.time,
                items: meal.foods.map(food => ({
                    id: String(food.id),
                    name: food.name,
                    quantity: food.qty,
                    unit: food.unit,
                    calories: Math.round((food.ptn * 4 + food.cho * 4 + food.fat * 9) * (typeof food.qty === 'number' ? food.qty : 0) / 100),
                    protein: Math.round((food.ptn * (typeof food.qty === 'number' ? food.qty : 0) / 100)),
                    carbs: Math.round((food.cho * (typeof food.qty === 'number' ? food.qty : 0) / 100)),
                    fats: Math.round((food.fat * (typeof food.qty === 'number' ? food.qty : 0) / 100)),
                    fiber: Math.round(((food.fib || 0) * (typeof food.qty === 'number' ? food.qty : 0) / 100))
                }))
            }));
        }

        // Use standard weekPlan meals - converting to compatible format
        return weekPlanMeals.map(meal => ({
            id: meal.id,
            name: meal.name,
            time: meal.time,
            items: meal.items.map(item => ({
                id: item.id,
                name: item.food?.nome || item.customName || 'Alimento',
                quantity: item.quantity,
                unit: item.unit,
                calories: Math.round(item.calories),
                protein: Math.round(item.protein),
                carbs: Math.round(item.carbs),
                fats: Math.round(item.fats),
                fiber: Math.round(item.fiber || 0)
            }))
        }));
    }, [activeTab, workspaceMeals, weekPlanMeals]);

    // Totals Calculation
    const totals = mealsToDisplay.reduce((acc, meal) => {
        meal.items.forEach(item => {
            acc.calories += item.calories
            acc.protein += item.protein
            acc.carbs += item.carbs
            acc.fats += item.fats
            acc.fiber += item.fiber
        })
        return acc
    }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 })

    const handleDownloadPDF = async () => {
        setIsDownloading(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        window.print()
        setIsDownloading(false)
    }

    const handleSendToPatient = async () => {
        setIsSending(true)
        setSendSuccess(false)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setSendSuccess(true)
        setIsSending(false)
        setTimeout(() => setSendSuccess(false), 3000)
    }

    const dietTypeLabel = DIET_TYPE_MACROS[dietType as keyof typeof DIET_TYPE_MACROS]?.label || 'Personalizada'

    const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="!max-w-none !w-screen !h-screen !m-0 !p-0 !rounded-none !border-none flex flex-col overflow-hidden bg-background print:bg-white print:p-0 print:m-0 !fixed !top-0 !left-0 !translate-x-0 !translate-y-0 z-[9999] shadow-none"
            >

                {/* HEADER ACTIONS (Screen Only) */}
                <div className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b border-border/10 print:hidden shrink-0 z-50 px-8">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                            <span className="text-sm font-normal uppercase tracking-widest text-foreground">Relatório Nutricional</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-normal opacity-60">Visualização de Impressão</span>
                        </div>
                    </DialogTitle>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl h-11 px-6 font-normal uppercase text-[11px] tracking-widest transition-all hover:scale-105 active:scale-95"
                        >
                            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                            IMPRIMIR PLANO
                        </Button>
                        <Button
                            onClick={handleSendToPatient}
                            disabled={isSending || !patient}
                            variant="outline"
                            className={cn(
                                "rounded-xl h-11 px-6 font-normal uppercase text-[11px] tracking-widest transition-all",
                                sendSuccess ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "hover:bg-primary/5 border-border/50"
                            )}
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : sendSuccess ? <Check className="h-4 w-4 mr-2" /> : <Smartphone className="h-4 w-4 mr-2" />}
                            {sendSuccess ? 'ENVIADO' : 'ENVIAR PARA APP'}
                        </Button>
                        <Separator orientation="vertical" className="h-8 mx-2" />
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-red-500/10 hover:text-red-500">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                {/* PDF CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 md:p-12 print:p-0 print:overflow-visible custom-scrollbar bg-slate-100/30 font-sans">
                    <div ref={contentRef} className="mx-auto max-w-[210mm] min-h-[297mm] bg-white text-slate-900 print:shadow-none shadow-2xl overflow-hidden flex flex-col relative print:w-full print:border-0 font-sans">

                        {/* DECORATIVE TOP BAR */}
                        <div className="h-3 w-full bg-emerald-500 print:h-2" />

                        {/* 1. DOCUMENT HEADER */}
                        <div className="p-12 pb-8 flex justify-between items-start print:p-8">
                            <div className="space-y-6 max-w-[60%]">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 overflow-hidden">
                                        {nutritionist?.logo ? (
                                            <img src={nutritionist.logo} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <Utensils className="h-7 w-7" />
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-normal text-slate-900 tracking-tighter uppercase leading-none">
                                        Plano<br /><span className="text-emerald-500">Alimentar</span>
                                    </h1>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-emerald-500 opacity-80">Prescrição Nutricional</p>
                                    <h2 className="text-2xl font-normal text-slate-800 tracking-tight">{patient?.name}</h2>
                                    <div className="flex items-center gap-2 text-xs font-normal text-slate-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Emitido em {today}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-3">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl min-w-[200px]">
                                    <p className="text-[9px] font-normal uppercase tracking-widest text-emerald-500 mb-1">Especialista</p>
                                    <p className="text-sm font-normal text-slate-800 leading-tight">{nutritionist?.name || 'Seu Nome'}</p>
                                    <p className="text-[10px] font-normal text-slate-400 mt-1">{nutritionist?.title || 'Nutricionista'} | CRN {nutritionist?.crn || '---'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. METRICS & GOALS STRIP */}
                        <div className="px-12 grid grid-cols-4 gap-4 print:px-8">
                            <MetricCard icon={Target} label="Meta Calórica" value={`${targetCalories} kcal`} color="text-emerald-500" />
                            <MetricCard icon={Flame} label="TMB Estimada" value={`${Math.round(tmb)} kcal`} color="text-orange-500" />
                            <MetricCard icon={Activity} label="Gasto Total" value={`${Math.round(get)} kcal`} color="text-blue-500" />
                            <MetricCard icon={ShieldCheck} label="Objetivo" value={(patient?.goal || 'Bem-estar').replace(/_/g, ' ')} color="text-violet-500" />
                        </div>

                        {/* 3. MACRO DISTRIBUTION BAR */}
                        <div className="px-12 mt-6 print:px-8">
                            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-normal">Estratégia</span>
                                        <span className="text-xs font-normal text-slate-700">{dietTypeLabel.toUpperCase()}</span>
                                    </div>
                                    <Separator orientation="vertical" className="h-8 bg-slate-200" />
                                    <div className="flex items-center gap-10">
                                        <MacroItem label="Proteína" value={`${totals.protein}g`} target={`${targetMacros.protein}g`} color="bg-emerald-500" />
                                        <MacroItem label="Carbo" value={`${totals.carbs}g`} target={`${targetMacros.carbs}g`} color="bg-blue-500" />
                                        <MacroItem label="Gordura" value={`${totals.fats}g`} target={`${targetMacros.fats}g`} color="bg-orange-500" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-500/10">
                                    <Zap className="h-5 w-5 text-emerald-500" />
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] uppercase font-normal text-emerald-500/60 tracking-widest">Total Prescrito</span>
                                        <span className="text-lg font-normal tabular-nums text-emerald-600">{Math.round(totals.calories)} kcal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. MEALS LIST */}
                        <div className="px-12 py-12 space-y-12 print:px-8 print:py-8">
                            {mealsToDisplay.map((meal, index) => (
                                <div key={meal.id} className="print:break-inside-avoid relative">
                                    {/* Vertical Line Connector */}
                                    {index < mealsToDisplay.length - 1 && (
                                        <div className="absolute left-[23px] top-12 bottom-[-48px] w-0.5 bg-slate-50 print:bg-slate-100" />
                                    )}

                                    <div className="flex items-start gap-6">
                                        <div className="relative z-10 shrink-0">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-900 font-normal text-lg transition-colors group-hover:bg-emerald-50 group-hover:border-emerald-100">
                                                {index + 1}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                <Utensils className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-end justify-between border-b border-slate-100 pb-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-normal uppercase text-emerald-500 tracking-widest">{meal.time}</span>
                                                    <h3 className="text-lg font-normal text-slate-800 tracking-tight uppercase">{meal.name}</h3>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/20 overflow-hidden">
                                                <Table>
                                                    <TableBody>
                                                        {meal.items.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell className="text-center py-8 text-slate-400 text-xs font-normal italic">
                                                                    Refeição em branco
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            meal.items.map((item) => (
                                                                <TableRow key={item.id} className="hover:bg-white/50 border-slate-50">
                                                                    <TableCell className="py-4 pl-6">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-normal text-slate-800">{item.name}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right py-4 pr-6">
                                                                        <div className="flex flex-col items-end">
                                                                            <span className="text-sm font-normal text-slate-800">{item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span></span>
                                                                            <span className="text-[10px] font-normal text-emerald-500 tabular-nums">{item.calories} kcal</span>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {/* MEAL FOOTER TOTALS */}
                                            {meal.items.length > 0 && (
                                                <div className="flex justify-end gap-6 pt-2 px-6">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-normal">Proteína</span>
                                                        <span className="text-xs font-normal text-slate-600">{Math.round(meal.items.reduce((a, b) => a + b.protein, 0))}g</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-normal">Carbo</span>
                                                        <span className="text-xs font-normal text-slate-600">{Math.round(meal.items.reduce((a, b) => a + b.carbs, 0))}g</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-normal">Gordura</span>
                                                        <span className="text-xs font-normal text-slate-600">{Math.round(meal.items.reduce((a, b) => a + b.fats, 0))}g</span>
                                                    </div>
                                                    <Separator orientation="vertical" className="h-8 bg-slate-100" />
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] uppercase tracking-widest text-emerald-500/60 font-normal">Total</span>
                                                        <span className="text-xs font-normal text-emerald-600 uppercase">{Math.round(meal.items.reduce((a, b) => a + b.calories, 0))} kcal</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 5. PROFESSIONAL FOOTER */}
                        <div className="mt-auto px-12 pb-12 print:px-8 print:pb-8 flex flex-col gap-8 print:break-inside-avoid">
                            <div className="p-8 rounded-[2rem] bg-emerald-50/50 border-2 border-emerald-100/50 flex items-center justify-between overflow-hidden relative group">
                                <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Utensils className="h-40 w-40 text-emerald-500" />
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-emerald-600">Considerações</p>
                                        <h4 className="text-xl font-normal text-slate-800 tracking-tight">Obrigado pela confiança!</h4>
                                    </div>
                                    <p className="text-xs text-slate-600 max-w-md leading-relaxed font-normal">
                                        Este plano alimentar foi elaborado especificamente para seu biotipo e rotina.
                                        A constância é a chave para os melhores resultados. Siga com foco!
                                    </p>
                                </div>
                                <div className="relative h-20 w-32 flex items-center justify-center z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-1 bg-slate-800/10 mb-2 rounded-full" />
                                        <span className="text-[9px] font-normal uppercase tracking-widest text-slate-400">Assinatura Digital</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t-2 border-slate-50 pt-8 text-[10px] font-normal text-slate-400 uppercase tracking-widest">
                                <div className="space-y-1 text-left">
                                    <p className="text-slate-800 text-xs font-normal">{nutritionist?.name || 'Seu Nome'}</p>
                                    <p className="flex items-center gap-1.5 min-h-[1.5rem]">
                                        Prescrito via
                                        <span className="flex items-center tracking-tighter normal-case text-slate-400">
                                            <span className="text-slate-600"><span className="text-[1.2em]">N</span>utri</span>
                                            <span className="text-emerald-500 whitespace-pre"> <span className="text-[1.4em]">X</span>pert</span>
                                            <span className="text-slate-600 ml-0.5"><span className="text-[1.2em]">P</span>ro</span>
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="flex items-center justify-end gap-2 text-slate-500">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {nutritionist?.address || 'Clinica NutriXpert'}
                                    </p>
                                    <p className="flex items-center justify-end gap-2 text-slate-500">
                                        <Phone className="h-3.5 w-3.5 text-emerald-500" /> {nutritionist?.phone || '(11) 98765-4321'}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}

// Sub-components
function MetricCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/60 flex flex-col gap-3 group hover:border-emerald-100 transition-all">
            <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4 opacity-70", color)} />
                <span className="text-[9px] font-normal uppercase text-slate-400 tracking-widest leading-none">{label}</span>
            </div>
            <span className="text-base font-normal text-slate-700 tracking-tight leading-none uppercase">{value}</span>
        </div>
    )
}

function MacroItem({ label, value, target, color }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", color)} />
                <span className="text-[10px] font-normal uppercase text-slate-400 tracking-widest leading-none">{label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-normal text-slate-700 leading-none">{value}</span>
                <span className="text-[9px] font-normal text-slate-300 leading-none">/ {target}</span>
            </div>
        </div>
    )
}

