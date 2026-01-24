"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRightLeft, Scale, Flame, Zap, ChefHat, Milk, Wheat, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Substitution {
    name: string
    quantity: number
    unit: string
    kcal: number
    protein: number
    carbs: number
    fats: number
    group?: string
    obs?: string
    source?: string
}

interface SubstitutionDrawerProps {
    originalFood: {
        name: string
        quantity: number
        unit: string
        kcal: number
    }
    substitutions: Substitution[]
    trigger?: React.ReactNode
}

// Helper para selecionar ícone baseado no grupo (mock simples por string)
const getGroupIcon = (group: string = "") => {
    const g = group.toLowerCase()
    if (g.includes("carbo") || g.includes("cereal") || g.includes("pão")) return <Wheat className="w-4 h-4" />
    if (g.includes("leite") || g.includes("laticínio") || g.includes("queijo")) return <Milk className="w-4 h-4" />
    if (g.includes("verdura") || g.includes("legume") || g.includes("fruta")) return <Leaf className="w-4 h-4" />
    if (g.includes("proteína") || g.includes("carne") || g.includes("ovo")) return <ChefHat className="w-4 h-4" />
    return <Zap className="w-4 h-4" />
}

export function SubstitutionDrawer({ originalFood, substitutions, trigger }: SubstitutionDrawerProps) {
    const [open, setOpen] = useState(false)

    if (!substitutions || substitutions.length === 0) return null

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-3 text-[11px] uppercase font-bold text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200/50 rounded-full transition-all shadow-sm backdrop-blur-sm"
                    >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Substituir
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="h-[88vh] flex flex-col rounded-t-[36px] border-none bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl">

                {/* Handle Bar */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 backdrop-blur-md z-50" />

                <DrawerHeader className="relative px-6 pt-10 pb-4 flex-shrink-0 text-left">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="w-fit bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50 px-2.5 py-0.5 text-[10px] tracking-wider font-bold uppercase rounded-md shadow-sm">
                                Opções Disponíveis
                            </Badge>
                        </div>
                        <DrawerTitle className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                            Substituições
                        </DrawerTitle>
                        <DrawerDescription className="text-base text-zinc-500 dark:text-zinc-400 font-medium">
                            Alternativas para <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{originalFood.name}</span>
                        </DrawerDescription>
                    </div>

                    {/* Card do Alimento Original - Destaque */}
                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ChefHat className="w-16 h-16 text-emerald-600 dark:text-emerald-400 rotate-12" />
                        </div>

                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest block mb-1">
                                    Alimento Original
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 items-center flex gap-1">
                                        {originalFood.quantity}
                                        <span className="text-sm font-semibold text-zinc-500">{originalFood.unit}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                                    <Flame className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-sm">{originalFood.kcal.toFixed(0)} kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </DrawerHeader>

                <ScrollArea className="flex-1 px-6 -mx-2">
                    <div className="space-y-3 pb-8 px-2 pt-2">
                        {substitutions.map((sub, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 + 0.1, duration: 0.3 }}
                                className="group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-200/50 dark:hover:border-emerald-800/30 transition-all duration-300"
                            >
                                {/* Efeito de hover sutil */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/30 to-transparent dark:via-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                {getGroupIcon(sub.group)}
                                            </div>
                                            <h4 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                                                {sub.name}
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-baseline gap-1 bg-zinc-50 dark:bg-zinc-900/80 px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-800/50">
                                                <Scale className="w-3 h-3 text-zinc-400" />
                                                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                                    {sub.quantity}
                                                </span>
                                                <span className="text-xs font-semibold text-zinc-500">
                                                    {sub.unit}
                                                </span>
                                            </div>

                                            {sub.group && (
                                                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide truncate max-w-[120px]">
                                                    {sub.group.replace("Indicado pelo Nutri", "Sugestão Nutri")}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comparativo Visual */}
                                    <div className="flex flex-col items-end justify-center h-full gap-1 pl-4 border-l border-dashed border-zinc-200 dark:border-zinc-800">
                                        {sub.kcal > 0 && (
                                            <div className="flex items-center gap-1 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                                <span className="text-sm font-bold tabular-nums">
                                                    {sub.kcal.toFixed(0)}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase">kcal</span>
                                            </div>
                                        )}

                                        {sub.source === 'manual' && (
                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[9px] px-1.5 h-5">
                                                Recomendado
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>

                <DrawerFooter className="px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950 flex-shrink-0 z-20">
                    <DrawerClose asChild>
                        <Button
                            className="w-full rounded-2xl h-14 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200 dark:shadow-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            Entendi
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

