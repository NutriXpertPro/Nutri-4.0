"use client"

import { Card } from "@/components/ui/card"
import { Flame, Droplets, Target, Loader2, AlertCircle } from "lucide-react"
import { useMetrics } from "@/hooks/useMetrics"
import { Button } from "@/components/ui/button"

export function MetricsCarousel() {
    const { metrics, loading, error } = useMetrics()

    if (loading) {
        return (
            <div className="w-full px-1">
                <div className="grid grid-cols-3 gap-3 w-full">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-3xl bg-card border border-border/10 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error || !metrics) {
        return (
            <div className="w-full px-1">
                <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-4 text-center">
                    <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                    <p className="text-xs text-destructive">{error || 'Erro ao carregar métricas'}</p>
                </div>
            </div>
        )
    }

    const metricsData = [
        {
            id: "calories",
            label: "Calorias",
            value: metrics.calories.current.toString(),
            target: metrics.calories.goal.toString(),
            unit: metrics.calories.unit,
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            progress: Math.round((metrics.calories.current / metrics.calories.goal) * 100)
        },
        {
            id: "water",
            label: "Água",
            value: metrics.water.current.toString(),
            target: metrics.water.goal.toString(),
            unit: metrics.water.unit,
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            progress: Math.round((metrics.water.current / metrics.water.goal) * 100)
        },
        {
            id: "focus",
            label: "Foco",
            value: metrics.focus.current.toString(),
            target: metrics.focus.goal.toString(),
            unit: metrics.focus.unit,
            icon: Target,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            progress: Math.round((metrics.focus.current / metrics.focus.goal) * 100)
        }
    ]

    return (
        <div className="w-full px-1">
            <div className="grid grid-cols-3 gap-3 w-full">
                {metricsData.map((metric) => {
                    const Icon = metric.icon
                    return (
                        <div key={metric.id} className="w-full">
                            <div className="h-32 rounded-3xl bg-gradient-to-br from-card to-muted border-primary/50 shadow-lg shadow-primary/10 p-3 flex flex-col justify-between relative overflow-hidden group">

                                {/* Background Ring Effect */}
                                <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full border-[4px] border-border/5 group-hover:scale-110 transition-transform duration-500" />

                                <div className={`${metric.bg} w-8 h-8 rounded-full flex items-center justify-center`}>
                                    <Icon className={`${metric.color} w-4 h-4`} />
                                </div>

                                <div>
                                    <div className="text-xl font-bold tracking-tighter text-card-foreground">
                                        {metric.value}
                                        <span className="text-[9px] text-muted-foreground ml-1 font-normal block">{metric.unit}</span>
                                    </div>

                                    {/* Mini Ring Progress */}
                                    <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${metric.color.replace('text-', 'bg-')} transition-all duration-1000`}
                                            style={{ width: `${metric.progress}%` }}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
