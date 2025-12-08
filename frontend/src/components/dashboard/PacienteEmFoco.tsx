"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MessageSquare, Phone, Target, TrendingUp, TrendingDown } from "lucide-react"

export interface Metric {
    label: string
    value: string | number
    trend?: number
    isPositive?: boolean
}

export interface Patient {
    id: string
    name: string
    avatar?: string
    goal: string
    metrics: Metric[]
}

interface PacienteEmFocoProps {
    patient?: Patient
    className?: string
}

// Mock data - será substituído por dados da API
const mockPatient: Patient = {
    id: "1",
    name: "Maria Silva",
    goal: "Perder 8kg",
    metrics: [
        { label: "IMC", value: "26.4", trend: -2, isPositive: true },
        { label: "Gordura", value: "22%", trend: -3, isPositive: true },
        { label: "Músculo", value: "58kg", trend: 1, isPositive: true },
        { label: "Peso", value: "78kg", trend: -5, isPositive: true },
    ],
}

export function PacienteEmFoco({ patient = mockPatient, className }: PacienteEmFocoProps) {
    return (
        <Card className={cn(
            "h-full relative overflow-hidden",
            // Destaque visual
            "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent",
            className
        )}>
            {/* Gradient accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    Próximo Paciente
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Patient Info */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                            {patient.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{patient.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="h-4 w-4 text-primary" />
                            <span>{patient.goal}</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2">
                    {patient.metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className={cn(
                                "text-center p-3 rounded-lg",
                                "bg-background/50 border border-border/50"
                            )}
                        >
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                                {metric.label}
                            </p>
                            <p className="font-bold text-lg">{metric.value}</p>
                            {metric.trend !== undefined && (
                                <div className={cn(
                                    "flex items-center justify-center gap-0.5 text-xs font-medium",
                                    metric.isPositive ? "text-green-500" : "text-red-500"
                                )}>
                                    {metric.isPositive ? (
                                        <TrendingDown className="h-3 w-3" />
                                    ) : (
                                        <TrendingUp className="h-3 w-3" />
                                    )}
                                    {metric.trend > 0 ? "+" : ""}{metric.trend}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="flex-1 gap-2" asChild>
                        <Link href={`/patients/${patient.id}`}>
                            <User className="h-4 w-4" />
                            Ver Perfil
                        </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Mensagem
                    </Button>
                    <Button size="icon-sm" variant="ghost">
                        <Phone className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton
export function PacienteEmFocoSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
