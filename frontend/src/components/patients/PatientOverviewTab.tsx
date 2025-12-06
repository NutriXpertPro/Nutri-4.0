"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/StatCard"
import { Activity, Calendar, TrendingUp, Utensils } from "lucide-react"

export function PatientOverviewTab() {
    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-medium">Progresso de Peso</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Início (3 meses atrás)</p>
                                <div className="text-xl font-bold text-muted-foreground">85.0 kg</div>
                            </div>
                            <div className="flex flex-col items-center px-4">
                                <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full mb-1">
                                    -12.5 kg
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Atual</p>
                                <div className="text-3xl font-bold">72.5 kg</div>
                            </div>
                        </div>

                        {/* Visual Gauge (Vermelho -> Amarelo -> Verde) */}
                        <div className="relative pt-2">
                            <div className="h-4 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 opacity-80" />
                            {/* Marcador de Posição (Exemplo: 60% do caminho para a meta) */}
                            <div
                                className="absolute top-1 bottom-0 w-1 h-6 bg-foreground border-2 border-background shadow-sm -mt-1 transform -translate-x-1/2 transition-all duration-500"
                                style={{ left: '60%' }}
                            />
                            {/* Marcador de Início */}
                            <div className="absolute top-6 left-0 text-[10px] text-muted-foreground">85kg</div>
                            {/* Marcador de Meta */}
                            <div className="absolute top-6 right-0 text-[10px] text-muted-foreground text-right">Meta: 65kg</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12 Dez</div>
                        <p className="text-xs text-muted-foreground">
                            às 14:30 (Online)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dieta Ativa</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Low Carb</div>
                        <p className="text-xs text-muted-foreground">
                            vence em 5 dias
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-2xl border bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Adesão</CardTitle>
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">87%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Excelente
                        </p>
                        {/* Mini bar chart visual */}
                        <div className="flex gap-1 mt-3 h-1.5">
                            <div className="flex-1 bg-emerald-500 rounded-full opacity-30"></div>
                            <div className="flex-1 bg-emerald-500 rounded-full opacity-30"></div>
                            <div className="flex-1 bg-emerald-500 rounded-full opacity-30"></div>
                            <div className="flex-1 bg-emerald-500 rounded-full opacity-30"></div>
                            <div className="flex-1 bg-emerald-500 rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Anotações Rápidas (Placeholder) */}
            <Card>
                <CardHeader>
                    <CardTitle>Anotações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border-l-4 border-primary pl-4 py-2 bg-muted/20 rounded-r-md">
                            <p className="text-sm font-medium">Paciente relatou dificuldade com o café da manhã.</p>
                            <p className="text-xs text-muted-foreground mt-1">05 Dez 2025 - 09:15</p>
                        </div>
                        <div className="border-l-4 border-muted pl-4 py-2 bg-muted/20 rounded-r-md">
                            <p className="text-sm font-medium">Exames de sangue solicitados.</p>
                            <p className="text-xs text-muted-foreground mt-1">20 Nov 2025 - 16:30</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
