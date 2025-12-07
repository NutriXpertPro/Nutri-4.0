"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts'
import { TrendingDown, User, Scale, Droplets, Flame, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const weightData = [
    { date: 'Jan', peso: 85.0 },
    { date: 'Fev', peso: 83.5 },
    { date: 'Mar', peso: 81.2 },
    { date: 'Abr', peso: 79.8 },
    { date: 'Mai', peso: 78.5 },
    { date: 'Jun', peso: 76.0 },
    { date: 'Jul', peso: 74.5 },
    { date: 'Ago', peso: 72.5 },
]

const compositionData = [
    { name: 'Massa Magra', atual: 32, meta: 35, icon: '💪', color: '#10b981' },
    { name: 'Gordura', atual: 28, meta: 22, icon: '🔥', color: '#f59e0b' },
    { name: 'Água', atual: 55, meta: 60, icon: '💧', color: '#3b82f6' },
]

// Cores modernas e vibrantes
const COLORS = {
    primary: '#6366f1',      // Indigo vibrante
    primaryLight: '#818cf8',
    secondary: '#22c55e',    // Verde sucesso
    accent: '#f59e0b',       // Laranja/Âmbar
    water: '#0ea5e9',        // Azul água
    muscle: '#10b981',       // Verde esmeralda
    fat: '#ef4444',          // Vermelho suave
    meta: '#94a3b8',         // Cinza elegante
    grid: '#e2e8f0',         // Grid suave
}

export function PatientAnalysisTab() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Análise Corporal
                    </h3>
                    <p className="text-sm text-muted-foreground">Evolução dos indicadores físicos nos últimos 6 meses</p>
                </div>
                <Select defaultValue="6m">
                    <SelectTrigger className="w-[180px] border-primary/20 focus:ring-primary/20">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3m">Últimos 3 meses</SelectItem>
                        <SelectItem value="6m">Últimos 6 meses</SelectItem>
                        <SelectItem value="1y">Último ano</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Gráfico de Evolução de Peso - Design Premium */}
                <Card className="col-span-2 lg:col-span-1 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                                    <Scale className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Evolução de Peso</CardTitle>
                                    <CardDescription className="text-xs">Progresso desde Jan/2024</CardDescription>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold">
                                -12.5 kg
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weightData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.4} />
                                            <stop offset="50%" stopColor={COLORS.primaryLight} stopOpacity={0.2} />
                                            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke={COLORS.grid}
                                        strokeOpacity={0.5}
                                    />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={11}
                                        fontWeight={500}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={11}
                                        fontWeight={500}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        domain={['dataMin - 3', 'dataMax + 3']}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ color: COLORS.primary, fontWeight: 600 }}
                                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                        formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Peso']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="peso"
                                        stroke={COLORS.primary}
                                        strokeWidth={3}
                                        fill="url(#weightGradient)"
                                        dot={{ fill: COLORS.primary, strokeWidth: 2, stroke: '#fff', r: 4 }}
                                        activeDot={{ r: 6, fill: COLORS.primary, stroke: '#fff', strokeWidth: 3, filter: 'url(#glow)' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Composição Corporal - Cards Horizontais Elegantes */}
                <Card className="col-span-2 lg:col-span-1 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Composição Corporal</CardTitle>
                                <CardDescription className="text-xs">Atual vs Meta definida</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-5">
                            {compositionData.map((item, index) => {
                                const percentage = (item.atual / item.meta) * 100
                                const isOnTrack = item.name === 'Gordura' ? item.atual <= item.meta : item.atual >= item.meta

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{item.icon}</span>
                                                <span className="font-medium text-sm">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold" style={{ color: item.color }}>
                                                    {item.atual}%
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    meta: {item.meta}%
                                                </span>
                                                {isOnTrack ? (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2">
                                                        ✓
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-2">
                                                        {item.name === 'Gordura' ? `+${item.atual - item.meta}%` : `-${item.meta - item.atual}%`}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Barra de progresso elegante */}
                                        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                            {/* Meta (background) */}
                                            <div
                                                className="absolute h-full bg-muted/80 rounded-full"
                                                style={{ width: `${item.meta}%` }}
                                            />
                                            {/* Atual (foreground) */}
                                            <div
                                                className="absolute h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                                                style={{
                                                    width: `${item.atual}%`,
                                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                                                    boxShadow: `0 0 10px ${item.color}40`
                                                }}
                                            />
                                            {/* Indicador de meta */}
                                            <div
                                                className="absolute h-full w-0.5 bg-foreground/60"
                                                style={{ left: `${item.meta}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Legenda */}
                        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                                <span className="text-xs text-muted-foreground">Atual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-6 rounded-full bg-muted" />
                                <span className="text-xs text-muted-foreground">Meta</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-0.5 bg-foreground/60" />
                                <span className="text-xs text-muted-foreground">Objetivo</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

