"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/StatCard"
import { Activity, Calendar, TrendingUp, Utensils, MessageSquareText } from "lucide-react"

import { IconWrapper } from "@/components/ui/IconWrapper"

export function PatientOverviewTab() {
    return (
        <div className="space-y-8 pb-10">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" className="col-span-1 md:col-span-2 border-none bg-background/40 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] text-primary uppercase tracking-[0.2em]">Monitoramento</p>
                            <CardTitle className="text-xl tracking-tight">Evolução de Peso</CardTitle>
                        </div>
                        <IconWrapper icon={Activity} variant="blue" size="md" className="group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex items-end justify-between mb-8">
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-40">Peso Inicial</p>
                                <div className="text-xl text-muted-foreground/60 tabular-nums">85.0 kg</div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm border border-emerald-500/10 animate-pulse">
                                    <TrendingUp className="h-4 w-4 rotate-180" />
                                    <span className="text-sm tabular-nums">-12.5 kg</span>
                                </div>
                                <p className="text-[8px] text-emerald-500/40 uppercase tracking-widest mt-2">Perda Total</p>
                            </div>

                            <div className="text-right space-y-1">
                                <p className="text-[10px] text-primary uppercase tracking-widest">Peso Atual</p>
                                <div className="text-5xl tracking-tighter text-foreground tabular-nums">72.5<span className="text-xl ml-1 text-muted-foreground/40">kg</span></div>
                            </div>
                        </div>

                        {/* Visual Gauge */}
                        <div className="relative pt-6 pb-2">
                            <div className="h-2 w-full rounded-full bg-muted/30 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/60 via-amber-400/60 to-emerald-500/60 blur-[1px]" />
                                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" style={{ width: '75%' }} />
                            </div>

                            {/* Marcador de Posição */}
                            <div
                                className="absolute top-5 w-4 h-4 bg-background border-4 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] rounded-full transform -translate-x-1/2 transition-all duration-1000 z-10"
                                style={{ left: '75%' }}
                            />

                            {/* Marcadores */}
                            <div className="flex justify-between mt-6">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-30">Início</span>
                                    <span className="text-xs tabular-nums">85kg</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] text-primary uppercase tracking-widest">Progresso</span>
                                    <div className="h-1 w-12 rounded-full bg-primary/20 mt-1" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] text-primary uppercase tracking-widest">Meta</span>
                                    <span className="text-xs tabular-nums">65kg</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <StatCard
                    title="Próxima Consulta"
                    value="12 Dez"
                    subtitle="às 14:30 • ONLINE"
                    icon={Calendar}
                    variant="blue"
                />

                <StatCard
                    title="Adesão Geral"
                    value="87%"
                    subtitle="EXCELENTE PERFORMANCE"
                    icon={TrendingUp}
                    variant="green"
                />
            </div>

            {/* Anotações Rápidas */}
            <Card variant="glass" className="border-none bg-background/40 shadow-xl group overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div className="flex items-center gap-4">
                        <IconWrapper icon={MessageSquareText} variant="amber" size="md" className="group-hover:rotate-12 transition-transform" />
                        <div className="space-y-1">
                            <p className="text-[10px] text-amber-500 uppercase tracking-widest">Clinical Notes</p>
                            <CardTitle className="text-xl tracking-tight">Últimas Anotações</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group/note relative bg-muted/20 hover:bg-muted/40 p-5 rounded-3xl border border-border/5 transition-all hover:translate-x-1">
                            <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                            <p className="text-sm text-foreground leading-relaxed">Paciente relatou dificuldade com o café da manhã, sugerida substituição por opção rápida.</p>
                            <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                                <Calendar className="h-3 w-3" />
                                05 Dez 2025 • 09:15
                            </div>
                        </div>

                        <div className="group/note relative bg-muted/10 hover:bg-muted/30 p-5 rounded-3xl border border-border/5 transition-all hover:translate-x-1">
                            <div className="absolute left-0 top-6 bottom-6 w-1 bg-muted-foreground/20 rounded-full" />
                            <p className="text-sm text-muted-foreground leading-relaxed">Exames de sangue solicitados (Hemograma + Lipidograma). Aguardando resultados.</p>
                            <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground/30 uppercase tracking-widest">
                                <Calendar className="h-3 w-3" />
                                20 Nov 2025 • 16:30
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
