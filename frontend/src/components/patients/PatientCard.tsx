"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    User,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    MessageSquare,
    UtensilsCrossed,
    Eye,
    Trash2,
    TrendingUp,
    TrendingDown,
} from "lucide-react"

interface Patient {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    createdAt: string
    lastVisit?: string
    status: "active" | "inactive"
    goal?: string
    progress?: {
        value: number
        isPositive: boolean
    }
}

interface PatientCardProps {
    patient: Patient
    className?: string
}

export function PatientCard({ patient, className }: PatientCardProps) {
    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1",
                "bg-card/80 backdrop-blur-sm border-border/50",
                className
            )}
        >
            {/* Status indicator */}
            <div
                className={cn(
                    "absolute top-0 right-0 w-2 h-full",
                    patient.status === "active" ? "bg-primary" : "bg-muted"
                )}
            />

            <CardContent className="p-4">
                {/* Header: Avatar + Name + Menu */}
                <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                            {patient.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{patient.name}</h3>
                            <Badge variant={patient.status === "active" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                                {patient.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                        </div>
                        {patient.goal && (
                            <p className="text-xs text-muted-foreground truncate">
                                🎯 {patient.goal}
                            </p>
                        )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/patients/${patient.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Perfil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Enviar Mensagem
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/diets/new?patient=${patient.id}`}>
                                    <UtensilsCrossed className="mr-2 h-4 w-4" />
                                    Criar Dieta
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        <span className="truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        <span>Desde {patient.createdAt}</span>
                    </div>
                </div>

                {/* Footer: Progress + CTA */}
                <div className="flex items-center justify-between pt-3 border-t">
                    {patient.progress ? (
                        <div className="flex items-center gap-1 text-sm">
                            {patient.progress.isPositive ? (
                                <TrendingDown className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingUp className="h-4 w-4 text-red-500" />
                            )}
                            <span
                                className={cn(
                                    "font-medium",
                                    patient.progress.isPositive ? "text-green-500" : "text-red-500"
                                )}
                            >
                                {patient.progress.value > 0 ? "-" : "+"}{Math.abs(patient.progress.value)}kg
                            </span>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground">Sem dados de progresso</div>
                    )}

                    <Button size="sm" variant="outline" asChild>
                        <Link href={`/patients/${patient.id}`}>
                            Ver Perfil
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton
export function PatientCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </div>
                </div>
                <div className="space-y-2 mb-4">
                    <div className="h-3 w-full bg-muted animate-pulse rounded" />
                    <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                </div>
            </CardContent>
        </Card>
    )
}
